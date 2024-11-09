import type { TSchema, Static } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type { PromptOptions, State } from "~/types";

import { useState, useEffect, useKeypress } from "~/hooks";
import { colorize } from "~/utils/colorize";
import { symbol } from "~/utils/states";
import { applyVariant } from "~/utils/variant";

export async function textPrompt<T extends TSchema>(
  options: PromptOptions<T>,
): Promise<Static<T>> {
  const {
    title,
    hint,
    validate,
    default: defaultValue,
    schema,
    titleColor,
    titleTypography,
    message,
    msgColor,
    msgTypography,
    titleVariant,
    msgVariant,
    defaultColor,
    defaultTypography,
    state: initialState = "initial",
  } = options;

  const [state, setState] = useState<State>(initialState);
  const [answer, setAnswer] = useState<string>(defaultValue || "");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const rl = readline.createInterface({ input, output });

  // Handle keypress events
  useKeypress(async (key) => {
    if (key.name === "enter") {
      // Perform validation
      let isValid = true;
      let error = "";

      if (schema) {
        isValid = Value.Check(schema, answer);
        if (!isValid) {
          const errors = [...Value.Errors(schema, answer)];
          error = errors[0]?.message || "Invalid input.";
        }
      }

      if (validate && isValid) {
        const validation = await validate(answer);
        if (validation !== true) {
          isValid = false;
          error =
            typeof validation === "string" ? validation : "Invalid input.";
        }
      }

      if (isValid) {
        setState("submit");
        rl.close();
        return answer as Static<T>;
      } else {
        setState("error");
        setErrorMessage(error);
      }
    } else if (key.name === "backspace") {
      setAnswer(answer.slice(0, -1));
    } else if (key.sequence) {
      setAnswer(answer + key.sequence);
    }
  });

  useEffect(() => {
    // Update the prompt display when state or answer changes
    const figure = symbol(state);
    const coloredTitle = colorize(title, titleColor, titleTypography);
    const promptText = `${figure} ${applyVariant([coloredTitle], titleVariant)}`;

    console.clear();
    console.log(promptText);
    if (hint) {
      console.log(`(${hint})`);
    }
    if (answer) {
      console.log(`Answer: ${answer}`);
    }
    if (state === "error") {
      console.log(`Error: ${errorMessage}`);
    }
  }, [state, answer]);

  return new Promise<Static<T>>((resolve) => {
    rl.on("close", () => {
      resolve(answer as Static<T>);
    });
  });
}
