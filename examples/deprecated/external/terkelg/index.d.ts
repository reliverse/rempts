export = prompts;

import { Readable, Writable } from "stream";
import { Kleur } from "kleur";

// add answer type when having only one question
declare function prompts<V = any, T extends string = string>(
  questions: prompts.PromptObject<T>,
  options?: prompts.Options,
): Promise<prompts.Answers<T, V>>;

declare function prompts<T extends string = string>(
  questions: Array<prompts.PromptObject<T>>,
  options?: prompts.Options,
): Promise<prompts.Answers<T>>;

declare namespace prompts {
  // Circular reference from prompts
  const prompt: any;

  function inject(arr: ReadonlyArray<any>): void;

  namespace inject {
    const prototype: {};
  }

  function override(obj: { [key: string]: any }): void;

  namespace override {
    const prototype: {};
  }

  namespace prompts {
    function autocomplete(args: PromptObject): any;

    function confirm(args: PromptObject): void;

    function date(args: PromptObject): any;

    function invisible(args: PromptObject): any;

    function list(args: PromptObject): any;

    function multiselect(args: PromptObject): any;

    function number(args: PromptObject): void;

    function password(args: PromptObject): any;

    function select(args: PromptObject): void;

    function text(args: PromptObject): void;

    function toggle(args: PromptObject): void;
  }

  interface Choice {
    title: string;
    value?: any;
    disabled?: boolean | undefined;
    selected?: boolean | undefined;
    description?: string | undefined;
    heading?: boolean | undefined;
  }

  interface Options {
    onSubmit?:
      | ((prompt: PromptObject, answer: any, answers: any[]) => void)
      | undefined;
    onCancel?: ((prompt: PromptObject, answers: any) => void) | undefined;
  }

  interface PromptObject<T extends string = string> {
    type: PromptType | Falsy | PrevCaller<T, PromptType | Falsy>;
    name: ValueOrFunc<T>;
    message?: ValueOrFunc<string> | undefined;
    initial?:
      | InitialReturnValue
      | PrevCaller<T, InitialReturnValue | Promise<InitialReturnValue>>
      | undefined;
    style?: string | PrevCaller<T, string | Falsy> | undefined;
    format?: PrevCaller<T, void> | undefined;
    validate?:
      | PrevCaller<T, boolean | string | Promise<boolean | string>>
      | undefined;
    onState?: PrevCaller<T, void> | undefined;
    onRender?: ((kleur: Kleur) => void) | undefined;
    min?: number | PrevCaller<T, number | Falsy> | undefined;
    max?: number | PrevCaller<T, number | Falsy> | undefined;
    float?: boolean | PrevCaller<T, boolean | Falsy> | undefined;
    round?: number | PrevCaller<T, number | Falsy> | undefined;
    instructions?: string | boolean | undefined;
    increment?: number | PrevCaller<T, number | Falsy> | undefined;
    separator?: string | PrevCaller<T, string | Falsy> | undefined;
    active?: string | PrevCaller<T, string | Falsy> | undefined;
    inactive?: string | PrevCaller<T, string | Falsy> | undefined;
    choices?: Choice[] | PrevCaller<T, Choice[] | Falsy> | undefined;
    hint?: string | PrevCaller<T, string | Falsy> | undefined;
    warn?: string | PrevCaller<T, string | Falsy> | undefined;
    suggest?: ((input: any, choices: Choice[]) => Promise<any>) | undefined;
    limit?: number | PrevCaller<T, number | Falsy> | undefined;
    mask?: string | PrevCaller<T, string | Falsy> | undefined;
    stdout?: Writable | undefined;
    stdin?: Readable | undefined;
  }

  type Answers<T extends string, V = any> = { [id in T]: V };

  type PrevCaller<T extends string, R = T> = (
    prev: any,
    values: Answers<T>,
    prompt: PromptObject,
  ) => R;

  type Falsy = false | null | undefined;

  type PromptType =
    | "text"
    | "password"
    | "invisible"
    | "number"
    | "confirm"
    | "list"
    | "toggle"
    | "select"
    | "multiselect"
    | "autocomplete"
    | "date"
    | "autocompleteMultiselect";

  type ValueOrFunc<T extends string> = T | PrevCaller<T>;

  type InitialReturnValue = string | number | boolean | Date;
}
