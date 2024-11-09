import type { TSchema } from "@sinclair/typebox";

export type Choice = {
  title: string;
  value: any;
  description?: string;
};

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

export type Variant =
  | "box"
  | "doubleBox"
  | "banner"
  | "underline"
  | "none"
  | "animated";

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

export type Typography =
  | "bold"
  | "strikethrough"
  | "underline"
  | "italic"
  | "rainbow"
  | "gradient"
  | "pulse"
  | "glitch"
  | "radar"
  | "neon"
  | "figlet";

export type State = "initial" | "active" | "cancel" | "submit" | "error";

export type PromptOptions<T extends TSchema = any> = {
  type: PromptType;
  id: string;
  title: string;
  titleColor?: ColorName;
  titleTypography?: Typography;
  titleVariant?: Variant;
  message?: string;
  msgColor?: ColorName;
  msgTypography?: Typography;
  msgVariant?: Variant;
  hint?: string;
  validate?: (value: any) => boolean | string | Promise<boolean | string>;
  default?: any;
  defaultColor?: ColorName;
  defaultTypography?: Typography;
  choices?: Choice[];
  schema?: T;
  variantOptions?: {
    box?: {
      limit?: number;
    };
  };
  action?: () => Promise<void>;
  state?: State;
};
