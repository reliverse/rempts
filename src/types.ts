import type { TSchema } from "@sinclair/typebox";

export type ColorName =
  | "dim"
  | "inverse"
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

export type Variant = "box" | "doubleBox" | "banner" | "underline" | "none"; 

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
  titleColor?: ColorName;
  titleTypography?: "bold" | "strikethrough" | "underline" | "italic";
  titleVariant?: Variant;
  message?: string;
  msgColor?: ColorName;
  msgTypography?: "bold" | "strikethrough" | "underline" | "italic";
  msgVariant?: Variant;
  hint?: string;
  validate?: (value: any) => boolean | string | Promise<boolean | string>;
  default?: any;
  choices?: Choice[];
  schema?: T;
  variantOptions?: {
    box?: {
      limit?: number;
    };
  };
  action?: () => Promise<void>;
};
