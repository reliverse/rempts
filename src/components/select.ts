// select.ts

import type { PromptOptions } from "~/utils/prompt";

import { createPrompt } from "~/utils/prompt";

type SelectOptions<T extends { value: any }> = {
  options: T[];
  initialValue?: T["value"];
} & PromptOptions<any>;

export function selectPrompt<T extends { value: any }>(opts: SelectOptions<T>) {
  const basePrompt = createPrompt(opts, false);

  const options = opts.options;
  let cursor = options.findIndex(({ value }) => value === opts.initialValue);
  if (cursor === -1) {
    cursor = 0;
  }

  function changeValue() {
    basePrompt.value = options[cursor].value;
  }

  basePrompt.on("cursor", (key) => {
    switch (key) {
      case "left":
      case "up":
        cursor = cursor === 0 ? options.length - 1 : cursor - 1;
        break;
      case "down":
      case "right":
        cursor = cursor === options.length - 1 ? 0 : cursor + 1;
        break;
    }
    changeValue();
  });

  // Initialize value
  changeValue();

  return {
    ...basePrompt,
    options,
    get cursor() {
      return cursor;
    },
    set cursor(val) {
      cursor = val;
    },
  };
}
