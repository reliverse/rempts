import { re } from "@reliverse/relico";

import type { PromptOptions } from "~/deprecated/prompt.js";

import Prompt from "~/deprecated/prompt.js";

export type TextOptions = {
  placeholder?: string;
  defaultValue?: string;
} & PromptOptions<InputPrompt>;

export default class InputPrompt extends Prompt {
  valueWithCursor = "";
  get cursor() {
    return this._cursor;
  }
  constructor(opts: TextOptions) {
    super(opts);

    this.on("finalize", () => {
      if (!this.value) {
        this.value = opts.defaultValue;
      }
      this.valueWithCursor = this.value;
    });
    this.on("value", () => {
      if (this.cursor >= this.value.length) {
        this.valueWithCursor = `${this.value}${re.inverse(re.hidden("_"))}`;
      } else {
        const s1 = this.value.slice(0, this.cursor);
        const s2 = this.value.slice(this.cursor);
        this.valueWithCursor = `${s1}${re.inverse(s2[0])}${s2.slice(1)}`;
      }
    });
  }
}
