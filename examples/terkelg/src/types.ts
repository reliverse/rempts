import type { Kleur } from "kleur";
import type { Readable, Writable } from "stream";

export type PromptFunction<V = any, T extends string = string> = (
  questions: PromptObject<T> | PromptObject<T>[],
  options?: Options,
) => Promise<Answers<T, V>>;

export type Prompts = {
  prompt: any;
  inject(arr: readonly any[]): void;
  override(obj: Record<string, any>): void;
  autocomplete(args: PromptObject): any;
  confirm(args: PromptObject): void;
  date(args: PromptObject): any;
  invisible(args: PromptObject): any;
  list(args: PromptObject): any;
  multiselect(args: PromptObject): any;
  number(args: PromptObject): void;
  password(args: PromptObject): any;
  select(args: PromptObject): void;
  text(args: PromptObject): void;
  toggle(args: PromptObject): void;
};

export type Choice = {
  title: string;
  value?: any;
  disabled?: boolean;
  selected?: boolean;
  description?: string;
  heading?: boolean;
};

export type Options = {
  onSubmit?: (prompt: PromptObject, answer: any, answers: any[]) => void;
  onCancel?: (prompt: PromptObject, answers: any) => void;
};

export type PromptObject<T extends string = string> = {
  type: PromptType | Falsy | PrevCaller<T, PromptType | Falsy>;
  name: ValueOrFunc<T>;
  message?: ValueOrFunc<string>;
  initial?:
    | InitialReturnValue
    | PrevCaller<T, InitialReturnValue | Promise<InitialReturnValue>>;
  style?: string | PrevCaller<T, string | Falsy>;
  format?: PrevCaller<T, void>;
  validate?: PrevCaller<T, boolean | string | Promise<boolean | string>>;
  onState?: PrevCaller<T, void>;
  onRender?: (kleur: Kleur) => void;
  min?: number | PrevCaller<T, number | Falsy>;
  max?: number | PrevCaller<T, number | Falsy>;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  float?: boolean | PrevCaller<T, boolean | Falsy>;
  round?: number | PrevCaller<T, number | Falsy>;
  instructions?: string | boolean;
  increment?: number | PrevCaller<T, number | Falsy>;
  separator?: string | PrevCaller<T, string | Falsy>;
  active?: string | PrevCaller<T, string | Falsy>;
  inactive?: string | PrevCaller<T, string | Falsy>;
  choices?: Choice[] | PrevCaller<T, Choice[] | Falsy>;
  hint?: string | PrevCaller<T, string | Falsy>;
  warn?: string | PrevCaller<T, string | Falsy>;
  suggest?: (input: any, choices: Choice[]) => Promise<any>;
  limit?: number | PrevCaller<T, number | Falsy>;
  mask?: string | PrevCaller<T, string | Falsy>;
  stdout?: Writable;
  stdin?: Readable;
};

export type Answers<T extends string, V = any> = Record<T, V>;

export type PrevCaller<T extends string, R = T> = (
  prev: any,
  values: Answers<T>,
  prompt: PromptObject,
) => R;

export type Falsy = false | null | undefined;

export type PromptType =
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

export type ValueOrFunc<T extends string> = T | PrevCaller<T>;

export type InitialReturnValue = string | number | boolean | Date;

export type MeridiemOptions = {
  token: string;
};
