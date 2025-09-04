(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.formatTime = factory().formatTime;
  }
})(this, function () {
  function formatTime(seconds) {
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    const m = Math.floor(seconds / 60);
    return `${m}:${s}`;
  }
  return { formatTime };
});
