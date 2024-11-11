import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { colorize } from "../utils/colorize";
import { applyVariant } from "../utils/variants";
export async function confirmPrompt(options) {
  const {
    title,
    default: defaultValue,
    schema,
    titleColor,
    titleTypography,
    content,
    contentColor,
    contentTypography,
    titleVariant,
    contentVariant
  } = options;
  const rl = readline.createInterface({ input, output });
  const coloredTitle = colorize(title, titleColor, titleTypography);
  const coloredContent = content ? colorize(content, contentColor, contentTypography) : "";
  const titleText = applyVariant([coloredTitle], titleVariant);
  const contentText = coloredContent ? applyVariant([coloredContent], contentVariant) : "";
  const promptText = [titleText, contentText].filter(Boolean).join("\n");
  let defaultHint = "";
  if (defaultValue === true) {
    defaultHint = "[Y/n]";
  } else if (defaultValue === false) {
    defaultHint = "[y/N]";
  } else {
    defaultHint = "[y/n]";
  }
  const question = `${promptText} ${defaultHint}: `;
  while (true) {
    const answer = (await rl.question(question)).toLowerCase();
    let value;
    if (!answer && defaultValue !== void 0) {
      value = defaultValue;
    } else if (answer === "y" || answer === "yes") {
      value = true;
    } else if (answer === "n" || answer === "no") {
      value = false;
    } else {
      console.log('Please answer with "y" or "n".');
      continue;
    }
    let isValid = true;
    let errorMessage = "Invalid input.";
    if (schema) {
      isValid = Value.Check(schema, value);
      if (!isValid) {
        const errors = [...Value.Errors(schema, value)];
        if (errors.length > 0) {
          errorMessage = errors[0]?.message ?? "Invalid input.";
        }
      }
    }
    if (isValid) {
      rl.close();
      return value;
    } else {
      console.log(errorMessage);
    }
  }
}
