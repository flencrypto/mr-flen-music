const { addToQueue, removeFromQueue, moveInQueue } = require('../public/queue-utils');

describe('queue-utils', () => {
  test('addToQueue appends tracks', () => {
    const q = addToQueue([], { id: 1 });
    expect(q).toHaveLength(1);
    expect(q[0].id).toBe(1);
  });

  test('removeFromQueue removes by index', () => {
    const q = removeFromQueue([{ id: 1 }, { id: 2 }], 0);
    expect(q).toHaveLength(1);
    expect(q[0].id).toBe(2);
  });

  test('moveInQueue reorders items', () => {
    const q = moveInQueue([{ id: 1 }, { id: 2 }, { id: 3 }], 0, 2);
    expect(q.map((t) => t.id)).toEqual([2, 3, 1]);
  });
});
