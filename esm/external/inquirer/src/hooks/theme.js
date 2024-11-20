import { figures } from "@/external/terkelg-tmp/src/lib/util";
import { blue, bold, cyan, dim, green, red, yellow } from "picocolors";
export const defaultTheme = {
    prefix: {
        idle: blue("?"),
        // TODO: use figure
        done: green(figures.tick),
    },
    spinner: {
        interval: 80,
        frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"].map((frame) => yellow(frame)),
    },
    style: {
        answer: cyan,
        message: bold,
        error: (text) => red(`> ${text}`),
        defaultAnswer: (text) => dim(`(${text})`),
        help: dim,
        highlight: cyan,
        key: (text) => cyan(bold(`<${text}>`)),
    },
};
