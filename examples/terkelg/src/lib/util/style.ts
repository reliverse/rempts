import c from "kleur";

import figures from "./figures";

// rendering user input.
const styles = Object.freeze({
  password: { scale: 1, render: (input: string) => "*".repeat(input.length) },
  emoji: { scale: 2, render: (input: string) => "😃".repeat(input.length) },
  invisible: { scale: 0, render: (input: string) => "" },
  default: { scale: 1, render: (input: string) => input },
});
const render = (type: keyof typeof styles) => styles[type] || styles.default;

// icon to signalize a prompt.
const symbols = Object.freeze({
  aborted: c.red(figures.cross),
  done: c.green(figures.tick),
  exited: c.yellow(figures.cross),
  default: c.cyan("?"),
});

const symbol = (done: boolean, aborted: boolean, exited: boolean) =>
  aborted
    ? symbols.aborted
    : exited
      ? symbols.exited
      : done
        ? symbols.done
        : symbols.default;

// between the question and the user's input.
const delimiter = (completing: boolean) =>
  c.gray(completing ? figures.ellipsis : figures.pointerSmall);

const item = (expandable: boolean, expanded: boolean) =>
  c.gray(expandable ? (expanded ? figures.pointerSmall : "+") : figures.line);

export default {
  styles,
  render,
  symbols,
  symbol,
  delimiter,
  item,
};
