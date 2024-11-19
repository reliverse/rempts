import { stdin as input, stdout as output } from "process";
import * as readline from "readline";

export async function multiSelectPrompt(options: string[]): Promise<string[]> {
  return new Promise((resolve) => {
    let selectedIndex = 0;
    const selectedOptions = new Set<number>();

    const rl = readline.createInterface({ input, output });
    readline.emitKeypressEvents(input, rl);

    if (input.isTTY) input.setRawMode(true);

    const render = () => {
      // Hide cursor and move to the top-left corner
      output.write("\x1B[?25l"); // Hide cursor
      output.write("\x1B[0f"); // Move cursor to top-left
      options.forEach((option, index) => {
        const isSelected = selectedIndex === index;
        const isChecked = selectedOptions.has(index);
        const prefix = isSelected ? "> " : "  ";
        const checkbox = isChecked ? "[x]" : "[ ]";
        output.write(`${prefix}${checkbox} ${option}\n`);
      });
      output.write("\x1B[J"); // Clear to the end of the screen
    };

    const onKeyPress = (str: string, key: readline.Key) => {
      if (key.name === "up") {
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        render();
      } else if (key.name === "down") {
        selectedIndex = (selectedIndex + 1) % options.length;
        render();
      } else if (key.name === "space") {
        if (selectedOptions.has(selectedIndex)) {
          selectedOptions.delete(selectedIndex);
        } else {
          selectedOptions.add(selectedIndex);
        }
        render();
      } else if (key.name === "return") {
        cleanup();
        const results = Array.from(selectedOptions).map(
          (index) => options[index],
        );
        resolve(results);
      } else if (key.name === "c" && key.ctrl) {
        cleanup();
        process.exit();
      }
    };

    const cleanup = () => {
      input.removeListener("keypress", onKeyPress);
      if (input.isTTY) input.setRawMode(false);
      rl.close();
      output.write("\x1B[?25h"); // Show cursor
      output.write("\n");
    };

    input.on("keypress", onKeyPress);
    render();
  });
}
