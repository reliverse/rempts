import { Value } from "@sinclair/typebox/value";
import { colorize } from "../utils/colorize";
export async function passwordPrompt(options) {
  const { title, hint, validate, schema, titleColor, titleTypography } = options;
  const coloredTitle = colorize(title, titleColor, titleTypography);
  const question = `${coloredTitle}${hint ? ` (${hint})` : ""}: `;
  process.stdout.write(question);
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    const passwordChars = [];
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = async (char) => {
      char = char.toString();
      if (char === "\n" || char === "\r" || char === "") {
        stdin.setRawMode(false);
        stdin.pause();
        process.stdout.write("\n");
        stdin.removeListener("data", onData);
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
            errorMessage = typeof validation === "string" ? validation : "Invalid input.";
          }
        }
        if (isValid) {
          resolve(password);
        } else {
          console.log(errorMessage);
          resolve(await passwordPrompt(options));
        }
      } else if (char === "") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        reject(new Error("User aborted."));
      } else if (char === "\x7F" || char === "\b" || char === "\x7F" || char === "\b") {
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
