// @ts-nocheck

function formatTime(seconds) {
  const numericSeconds = Number(seconds);
  if (!Number.isFinite(numericSeconds) || numericSeconds <= 0) {
    return "0:00";
  }

  const wholeSeconds = Math.floor(numericSeconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainder = wholeSeconds % 60;

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

if (typeof module !== "undefined") {
  module.exports = { formatTime };
}

if (typeof window !== "undefined") {
  window.formatTime = formatTime;
}
