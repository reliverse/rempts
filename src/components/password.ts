import type { Static, TSchema } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";

import type { PromptOptions } from "~/types";

export async function passwordPrompt<T extends TSchema>(
  options: PromptOptions<T>,
): Promise<Static<T>> {
  const { title, hint, validate, schema } = options;
  const question = `${title}${hint ? ` (${hint})` : ""}: `;

  process.stdout.write(question);

  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    const passwordChars: string[] = [];

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const onData = async (char: string) => {
      char = char.toString();

      if (char === "\n" || char === "\r" || char === "\u0004") {
        // Enter or Ctrl-D
        stdin.setRawMode(false);
        stdin.pause();
        process.stdout.write("\n");
        stdin.removeListener("data", onData); // Clean up listener
        const password = passwordChars.join("");

        let isValid = true;
        let errorMessage = "Invalid input.";
        if (schema) {
          isValid = Value.Check(schema, password);
          if (!isValid) {
            const errors = [...Value.Errors(schema, password)];
            if (errors.length > 0) {
              errorMessage = errors[0]?.message ?? "Invalid input.";
            }
          }
        }
        if (validate && isValid) {
          const validation = await validate(password);
          if (validation !== true) {
            isValid = false;
            errorMessage =
              typeof validation === "string" ? validation : "Invalid input.";
          }
        }
        if (isValid) {
          resolve(password as Static<T>);
        } else {
          console.log(errorMessage);
          // Retry
          resolve(await passwordPrompt(options));
        }
      } else if (char === "\u0003") {
        // Ctrl-C
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData); // Clean up listener
        reject(new Error("User aborted."));
      } else if (
        char === "\u007F" ||
        char === "\b" ||
        char === "\x7f" ||
        char === "\x08"
      ) {
        // Backspace
        if (passwordChars.length > 0) {
          passwordChars.pop();
          process.stdout.write("\b \b");
        }
      } else {
        passwordChars.push(char);
        process.stdout.write("*");
      }
    };

    stdin.on("data", onData);
  });
}
