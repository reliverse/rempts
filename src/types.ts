import type { TSchema } from "@sinclair/typebox";

export type ColorName =
  | "dim"
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "cyanBright"
  | "bgCyan"
  | "bgCyanBright"
  | "white"
  | "gray"
  | "grey"
  | "none";

export type Variant = "box";

export type Choice = {
  title: string;
  value: any;
  description?: string;
};

export type PromptType =
  | "text"
  | "number"
  | "confirm"
  | "select"
  | "multiselect"
  | "password"
  | "date"
  | "start"
  | "nextSteps"
  | "end";

export type PromptOptions<T extends TSchema = any> = {
  type: PromptType;
  id: string;
  title: string;
  hint?: string;
  validate?: (value: any) => boolean | string | Promise<boolean | string>;
  default?: any;
  choices?: Choice[];
  schema?: T;
  color?: ColorName;
  variant?: Variant;
  action?: () => Promise<void>;
};
