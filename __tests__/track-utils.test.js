const { normalizeTrack } = require('../public/track-utils');

describe('normalizeTrack', () => {
  test('fills missing fields with defaults', () => {
    const t = normalizeTrack({});
    expect(t.title).toBe('Untitled');
    expect(t.artist).toBe('Unknown artist');
    expect(t.durationMs).toBeNull();
    expect(t.artwork).toContain('placeholder');
  });

  test('keeps existing values', () => {
    const t = normalizeTrack({ title:'X', artist:'Y', durationMs:123, artwork:'img.png' });
    expect(t.title).toBe('X');
    expect(t.artist).toBe('Y');
    expect(t.durationMs).toBe(123);
    expect(t.artwork).toBe('img.png');
  });
});
