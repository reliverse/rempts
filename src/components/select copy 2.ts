import { stdin as input, stdout as output } from "process";
import * as readline from "readline";

export async function selectPrompt(options: string[]): Promise<string> {
  return new Promise((resolve) => {
    let selected = 0;

    const rl = readline.createInterface({ input, output });
    readline.emitKeypressEvents(input, rl);

    if (input.isTTY) input.setRawMode(true);

    const render = () => {
      // Clear the console
      output.write("\x1B[2J\x1B[0f");
      options.forEach((option, index) => {
        if (index === selected) {
          output.write(`> ${option}\n`);
        } else {
          output.write(`  ${option}\n`);
        }
      });
    };

    const onKeyPress = (str: string, key: readline.Key) => {
      if (key.name === "up") {
        selected = (selected - 1 + options.length) % options.length;
        render();
      } else if (key.name === "down") {
        selected = (selected + 1) % options.length;
        render();
      } else if (key.name === "return") {
        cleanup();
        resolve(options[selected]);
      } else if (key.name === "c" && key.ctrl) {
        cleanup();
        process.exit();
      }
    };

    const cleanup = () => {
      input.removeListener("keypress", onKeyPress);
      if (input.isTTY) input.setRawMode(false);
      rl.close();
      output.write("\n");
    };

    input.on("keypress", onKeyPress);
    render();
  });
}
