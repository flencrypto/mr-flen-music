// @ts-nocheck

function formatTime(seconds) {
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  const m = Math.floor(seconds / 60);
  return `${m}:${s}`;
}

if (typeof module !== "undefined") {
  module.exports = { formatTime };
}

if (typeof window !== "undefined") {
  window.formatTime = formatTime;
}
