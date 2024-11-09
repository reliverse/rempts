type WrapOptions = {
  margin?: number | string;
  width: number;
};

/**
 * @param {string} msg The message to wrap
 * @param {WrapOptions} opts Options object with margin and width
 */
export default (msg: string, opts: WrapOptions = { margin: 0, width: 80 }) => {
  const margin =
    typeof opts.margin === "number"
      ? opts.margin
      : parseInt(opts.margin ?? "0", 10);
  const tab = Number.isSafeInteger(margin) ? " ".repeat(margin) : "";

  const width = opts.width;

  return (msg || "")
    .split(/\r?\n/g)
    .map((line) =>
      line
        .split(/\s+/g)
        .reduce<string[]>(
          (arr, w) => {
            const lastLine = arr[arr.length - 1] ?? "";
            if (
              w.length + tab.length >= width ||
              lastLine.length + w.length + 1 < width
            ) {
              arr[arr.length - 1] = `${lastLine} ${w}`.trim();
            } else {
              arr.push(`${tab}${w}`);
            }
            return arr;
          },
          [tab],
        )
        .join("\n"),
    )
    .join("\n");
};
