import type { TSchema, Static } from "@sinclair/typebox";

import { symbol } from "@/deprecated/reliverse/experiments/utils/symbols.js";
import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

import type {
  PromptOptionsDeprecated,
  StateDeprecated,
} from "~/types/internal.js";
import type { RelinkaReadline } from "~/types/readline.js";

import {
  useState,
  useEffect,
  useKeypress,
  type KeypressEvent,
} from "~/components/core/index.js";
import { colorize } from "~/utils/colorize.js";
import { applyVariant } from "~/utils/variants.js";

export async function inputPrompt<T extends TSchema>(
  options: PromptOptionsDeprecated<T>,
): Promise<Static<T>> {
  const {
    title,
    hint,
    validate,
    defaultValue,
    schema,
    titleColor,
    titleTypography,
    content,
    contentColor,
    contentTypography,
    titleVariant,
    contentVariant,
    defaultColor,
    defaultTypography,
    state: initialState = "initial",
  } = options;

  const [state, setState] = useState<StateDeprecated>(initialState);
  const [answer, setAnswer] = useState<string | number | boolean>(
    defaultValue as string | number | boolean,
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const rl = readline.createInterface({ input, output });
  // Handle keypress events
  useKeypress(async (event: KeypressEvent, rl: RelinkaReadline) => {
    if (event.name === "enter") {
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
      } else {
        setState("error");
        setErrorMessage(error);
      }
    } else if (event.name === "backspace") {
      setAnswer((answer as string).slice(0, -1));
      // @ts-expect-error -- TODO: fix ts
    } else if (event.sequence) {
      // @ts-expect-error -- TODO: fix ts
      setAnswer((answer as string) + event.sequence);
    }
  });

  useEffect(() => {
    // Update the prompt display when state or answer changes
    const figure = symbol("S_MIDDLE", state);
    const coloredTitle = colorize(title, titleColor, titleTypography);
    const promptText = `${figure} ${applyVariant([coloredTitle], titleVariant)}`;

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
