const { formatTime } = require('../format-time');

describe('formatTime', () => {
  test('formats seconds to m:ss', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(65)).toBe('1:05');
  });

  test('clamps invalid or negative input to zero', () => {
    expect(formatTime(-10)).toBe('0:00');
    expect(formatTime('invalid')).toBe('0:00');
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe('0:00');
  });
});
