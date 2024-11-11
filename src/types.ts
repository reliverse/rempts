import type { TSchema } from "@sinclair/typebox";

export type MsgType = "MT_START" | "MT_MIDDLE" | "MT_END";

export type SymbolCharacter =
  | "S_START"
  | "S_MIDDLE"
  | "S_END"
  | "S_LINE"
  | "S_STEP_ACTIVE"
  | "S_STEP_CANCEL"
  | "S_STEP_ERROR"
  | "S_STEP_SUBMIT"
  | "S_RADIO_ACTIVE"
  | "S_RADIO_INACTIVE"
  | "S_CHECKBOX_ACTIVE"
  | "S_CHECKBOX_SELECTED"
  | "S_CHECKBOX_INACTIVE"
  | "S_PASSWORD_MASK"
  | "S_BAR_H"
  | "S_CORNER_TOP_RIGHT"
  | "S_CONNECT_LEFT"
  | "S_CORNER_BOTTOM_RIGHT"
  | "S_INFO"
  | "S_SUCCESS"
  | "S_WARN"
  | "S_ERROR";

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
  | "gradientGradient"
  | "rainbowGradient"
  | "cristalGradient"
  | "mindGradient"
  | "passionGradient"
  | "viceGradient"
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

export type State =
  | "initial"
  | "active"
  | "completed"
  | "cancel"
  | "submit"
  | "error";

export type PromptOptions<T extends TSchema = any> = {
  type: PromptType;
  id: string;
  title: string;
  stateCompletedTitle?: string;
  titleColor?: ColorName;
  titleTypography?: Typography;
  titleVariant?: Variant;
  content?: string;
  contentColor?: ColorName;
  contentTypography?: Typography;
  contentVariant?: Variant;
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
  dashCount?: number;
};

export type PromptState = {
  id: string;
  state: State;
  symbol: string;
  value: any;
};

export type Choice = {
  title: string;
  value: any;
  description?: string;
};
