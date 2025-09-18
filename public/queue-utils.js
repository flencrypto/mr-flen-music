(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.queueUtils = factory();
  }
})(this, function () {
  function addToQueue(queue = [], track) {
    const arr = Array.isArray(queue) ? queue.slice() : [];
    if (track) arr.push(track);
    return arr;
  }

  function removeFromQueue(queue = [], index) {
    const arr = Array.isArray(queue) ? queue.slice() : [];
    if (index >= 0 && index < arr.length) arr.splice(index, 1);
    return arr;
  }

  function moveInQueue(queue = [], from, to) {
    const arr = Array.isArray(queue) ? queue.slice() : [];
    if (
      from >= 0 &&
      from < arr.length &&
      to >= 0 &&
      to < arr.length &&
      from !== to
    ) {
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
    }
    return arr;
  }

  function adjustIndexOnRemove(currentIndex, removedIndex) {
    if (typeof currentIndex !== 'number' || currentIndex < 0) {
      return currentIndex;
    }
    if (typeof removedIndex !== 'number' || removedIndex < 0) {
      return currentIndex;
    }
    if (removedIndex > currentIndex) {
      return currentIndex;
    }
    const nextIndex = currentIndex - 1;
    return nextIndex >= 0 ? nextIndex : -1;
  }

  function previousIndex(currentIndex) {
    return currentIndex > 0 ? currentIndex - 1 : currentIndex;
  }

  return {
    addToQueue,
    removeFromQueue,
    moveInQueue,
    adjustIndexOnRemove,
    previousIndex,
  };
});
