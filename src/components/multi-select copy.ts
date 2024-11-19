// multi-select.ts

import type { PromptOptions } from "~/utils/prompt";

import { createPrompt } from "~/utils/prompt";

type MultiSelectOptions<T extends { value: any }> = {
  options: T[];
  initialValues?: T["value"][];
  required?: boolean;
  cursorAt?: T["value"];
} & PromptOptions<any>;

export function multiSelectPrompt<T extends { value: any }>(
  opts: MultiSelectOptions<T>,
) {
  const basePrompt = createPrompt(opts, false);

  const options = opts.options;
  let cursor = Math.max(
    options.findIndex(({ value }) => value === opts.cursorAt),
    0,
  );

  let value: T["value"][] = [...(opts.initialValues ?? [])];

  function toggleAll() {
    const allSelected = value.length === options.length;
    value = allSelected ? [] : options.map((v) => v.value);
    basePrompt.value = value;
  }

  function toggleValue() {
    const selected = value.includes(options[cursor].value);
    if (selected) {
      value = value.filter((val) => val !== options[cursor].value);
    } else {
      value = [...value, options[cursor].value];
    }
    basePrompt.value = value;
  }

  basePrompt.on("key", (char) => {
    if (char === "a") {
      toggleAll();
    }
  });

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
      case "space":
        toggleValue();
        break;
    }
  });

  // Initialize value
  basePrompt.value = value;

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
