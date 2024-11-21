// @ts-nocheck

export default (cursor, total, maxVisible) => {
  maxVisible = maxVisible || total;
  let startIndex = Math.min(
    total - maxVisible,
    cursor - Math.floor(maxVisible / 2),
  );
  if (startIndex < 0) startIndex = 0;
  let endIndex = Math.min(startIndex + maxVisible, total);
  return { startIndex, endIndex };
};
