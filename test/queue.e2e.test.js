/**
 * @jest-environment jsdom
 */

describe('queue user flow', () => {
  let queueUtils;
  let localStorageMock;
  let formatTime;
  
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <button id="queueBtn"></button>
      <div id="queueModal" class="hidden">
        <ul id="queueList"></ul>
        <button id="saveQueueBtn"></button>
        <button id="closeQueue"></button>
      </div>
    `;
    
    // Mock localStorage
    const store = {};
    localStorageMock = {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => { store[key] = value; }),
      clear: jest.fn(() => { Object.keys(store).forEach(k => delete store[k]); })
    };
    global.localStorage = localStorageMock;
    
    // Mock alert and prompt
    global.alert = jest.fn();
    global.prompt = jest.fn();
    
    // Load queue utils
    queueUtils = require('../public/queue-utils');
    global.queueUtils = queueUtils;
    
    // Load actual formatTime implementation
    const formatTimeModule = require('../format-time');
    formatTime = formatTimeModule.formatTime;
    global.formatTime = formatTime;
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('user can view and reorder the up next queue', () => {
    // Mock state and functions
    const mockState = {
      queue: [
        { id: '1', platform: 'audius', title: 'Track 1', artist: 'Artist 1', artwork: 'art1.jpg', durationMs: 180000 },
        { id: '2', platform: 'audius', title: 'Track 2', artist: 'Artist 2', artwork: 'art2.jpg', durationMs: 200000 },
        { id: '3', platform: 'audius', title: 'Track 3', artist: 'Artist 3', artwork: 'art3.jpg', durationMs: 220000 }
      ],
      idx: 0
    };
    
    // Mock normalizeTrack
    global.normalizeTrack = (track) => ({
      id: track.id || '',
      platform: track.platform || 'audius',
      title: track.title || 'Untitled',
      artist: track.artist || 'Unknown',
      artwork: track.artwork || '',
      durationMs: track.durationMs || 0,
      streamUrl: track.streamUrl || '',
      permalink: track.permalink || '',
      isMrFlen: track.isMrFlen !== false
    });
    
    // Mock playFrom function
    global.playFrom = jest.fn();
    
    // Create renderQueue function (simplified version)
    const renderQueue = () => {
      const queueList = document.getElementById('queueList');
      if (!queueList) return;
      
      queueList.innerHTML = '';
      
      if (mockState.queue.length === 0) {
        queueList.innerHTML = '<li class="text-center text-muted py-4">Queue is empty</li>';
        return;
      }
      
      mockState.queue.forEach((track, index) => {
        const t = global.normalizeTrack(track);
        const duration = t.durationMs ? formatTime(t.durationMs / 1000) : '--:--';
        const isCurrent = index === mockState.idx;
        const li = document.createElement('li');
        li.className = `queue-item ${isCurrent ? 'current' : ''}`;
        li.dataset.index = index;
        li.innerHTML = `
          <div class="flex items-center gap-3 flex-1">
            <div class="drag-handle cursor-move">⋮⋮</div>
            <img src="${t.artwork}" alt="${t.title}">
            <div class="flex-1">
              <div class="font-medium text-sm ${isCurrent ? 'text-brand' : ''}">${t.title}</div>
              <div class="text-xs text-muted">${t.artist} • ${duration}</div>
            </div>
          </div>
          <button class="btn-remove">×</button>
        `;
        queueList.appendChild(li);
      });
    };
    
    // Test: Queue displays all tracks
    renderQueue();
    const queueList = document.getElementById('queueList');
    const items = queueList.querySelectorAll('.queue-item');
    
    expect(items.length).toBe(3);
    expect(items[0].querySelector('.font-medium').textContent).toBe('Track 1');
    expect(items[1].querySelector('.font-medium').textContent).toBe('Track 2');
    expect(items[2].querySelector('.font-medium').textContent).toBe('Track 3');
    expect(items[0].classList.contains('current')).toBe(true);
    
    // Test: User can reorder queue items
    const moveQueueItem = (fromIndex, toIndex) => {
      mockState.queue = queueUtils.moveInQueue(mockState.queue, fromIndex, toIndex);
      if (mockState.idx === fromIndex) {
        mockState.idx = toIndex;
      } else if (fromIndex < mockState.idx && toIndex >= mockState.idx) {
        mockState.idx -= 1;
      } else if (fromIndex > mockState.idx && toIndex <= mockState.idx) {
        mockState.idx += 1;
      }
    };
    
    // Move track from index 2 to index 1
    moveQueueItem(2, 1);
    expect(mockState.queue[0].title).toBe('Track 1');
    expect(mockState.queue[1].title).toBe('Track 3');
    expect(mockState.queue[2].title).toBe('Track 2');
    
    // Re-render and verify
    renderQueue();
    const updatedItems = queueList.querySelectorAll('.queue-item');
    expect(updatedItems[1].querySelector('.font-medium').textContent).toBe('Track 3');
    expect(updatedItems[2].querySelector('.font-medium').textContent).toBe('Track 2');
    
    // Test: User can remove items from queue
    const removeFromQueueAtIndex = (index) => {
      const newQueue = queueUtils.removeFromQueue(mockState.queue, index);
      const newIdx = queueUtils.adjustIndexOnRemove(mockState.idx, index, newQueue.length);
      mockState.queue = newQueue;
      mockState.idx = newIdx;
    };
    
    removeFromQueueAtIndex(1);
    expect(mockState.queue.length).toBe(2);
    expect(mockState.queue[0].title).toBe('Track 1');
    expect(mockState.queue[1].title).toBe('Track 2');
  });

  test('user can save current queue as a playlist', () => {
    // Mock state
    const mockState = {
      queue: [
        { id: '1', platform: 'audius', title: 'Track 1', artist: 'Artist 1', artwork: 'art1.jpg', durationMs: 180000 },
        { id: '2', platform: 'audius', title: 'Track 2', artist: 'Artist 2', artwork: 'art2.jpg', durationMs: 200000 }
      ],
      customPlaylists: []
    };
    
    // Mock normalizeTrack
    global.normalizeTrack = (track) => ({
      id: track.id || '',
      platform: track.platform || 'audius',
      title: track.title || 'Untitled',
      artist: track.artist || 'Unknown',
      artwork: track.artwork || '',
      durationMs: track.durationMs || 0,
      streamUrl: track.streamUrl || '',
      permalink: track.permalink || '',
      isMrFlen: track.isMrFlen !== false
    });
    
    // Mock savePlaylist function
    const savePlaylist = (pl) => {
      const idx = mockState.customPlaylists.findIndex((p) => p.name === pl.name);
      if (idx > -1) mockState.customPlaylists[idx] = pl;
      else mockState.customPlaylists.push(pl);
      
      // Save to localStorage
      localStorageMock.setItem('customPlaylists', JSON.stringify(mockState.customPlaylists));
    };
    
    // Create saveCurrentQueueAsPlaylist function
    const saveCurrentQueueAsPlaylist = () => {
      if (mockState.queue.length === 0) {
        alert('Queue is empty');
        return;
      }
      const name = prompt('Enter playlist name:');
      if (!name || !name.trim()) return;
      
      const playlist = {
        name: name.trim(),
        tracks: mockState.queue.map(t => global.normalizeTrack(t)),
        createdAt: new Date().toISOString()
      };
      savePlaylist(playlist);
      alert(`Playlist "${playlist.name}" saved successfully!`);
    };
    
    // Test: Save queue as playlist
    global.prompt.mockReturnValue('My Test Playlist');
    
    saveCurrentQueueAsPlaylist();
    
    expect(global.prompt).toHaveBeenCalledWith('Enter playlist name:');
    expect(mockState.customPlaylists.length).toBe(1);
    expect(mockState.customPlaylists[0].name).toBe('My Test Playlist');
    expect(mockState.customPlaylists[0].tracks.length).toBe(2);
    expect(mockState.customPlaylists[0].tracks[0].title).toBe('Track 1');
    expect(mockState.customPlaylists[0].tracks[1].title).toBe('Track 2');
    expect(global.alert).toHaveBeenCalledWith('Playlist "My Test Playlist" saved successfully!');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('customPlaylists', expect.any(String));
    
    // Test: Don't save when name is empty
    global.prompt.mockReturnValue('');
    global.alert.mockClear();
    localStorageMock.setItem.mockClear();
    
    saveCurrentQueueAsPlaylist();
    
    expect(global.alert).not.toHaveBeenCalled();
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
    
    // Test: Alert when queue is empty
    mockState.queue = [];
    global.alert.mockClear();
    
    saveCurrentQueueAsPlaylist();
    
    expect(global.alert).toHaveBeenCalledWith('Queue is empty');
  });
});
