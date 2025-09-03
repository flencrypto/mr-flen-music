const { formatTime } = require('../format-time');

describe('formatTime', () => {
  test('formats seconds to m:ss', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(65)).toBe('1:05');
  });
});
