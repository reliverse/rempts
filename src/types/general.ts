import type { AnimationName } from "@figliolia/chalk-animation";
import type { TSchema } from "@sinclair/typebox";

export type State = "initial" | "active" | "cancel" | "submit" | "error";

export type MsgType =
  | "M_NULL"
  | "M_START"
  | "M_MIDDLE"
  | "M_GENERAL"
  | "M_GENERAL_NULL"
  | "M_INFO"
  | "M_INFO_NULL"
  | "M_NEWLINE"
  | "M_END"
  | "M_ERROR"
  | "M_ERROR_NULL";

export type TypographyName = "bold" | "strikethrough" | "underline" | "italic";

export type VariantName =
  | "box"
  | "doubleBox"
  | "banner"
  | "underline"
  | "none"
  | "animated";

export type ColorName =
  | "dim"
  | "inverse"
  | "black"
  | "red"
  | "redBright"
  | "bgRed"
  | "bgRedBright"
  | "green"
  | "greenBright"
  | "bgGreen"
  | "bgGreenBright"
  | "yellow"
  | "yellowBright"
  | "blue"
  | "blueBright"
  | "magenta"
  | "cyan"
  | "cyanBright"
  | "bgCyan"
  | "bgCyanBright"
  | "white"
  | "gray"
  | "gradientGradient"
  | "rainbowGradient"
  | "cristalGradient"
  | "mindGradient"
  | "passionGradient"
  | "viceGradient"
  | "retroGradient"
  | "none";

export type MsgConfig = {
  symbol: string;
  prefix?: string;
  color?: (text: string) => string;
  newLineBefore?: boolean;
  newLineAfter?: boolean;
  suffix?: string;
};

export type FmtMsgOptions = {
  type: MsgType;
  title?: string;
  titleAfterAnim?: string;
  content?: string;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  contentVariant?: VariantName;
  hint?: string;
  hintColor?: ColorName;
  border?: boolean;
  borderColor?: ColorName;
  dontRemoveBar?: boolean;
  variantOptions?: {
    box?: {
      limit?: number;
    };
  };
  errorMessage?: string;
  addNewLineBefore?: boolean;
  addNewLineAfter?: boolean;
  placeholder?: string;
  horizontalLine?: boolean;
  horizontalLineLength?: number;
};

export type OldPromptOptions<T extends TSchema = any> = {
  PromptOptions: PromptOptions<T>;
};

export type PromptOptions<T extends TSchema = any> = {
  schema?: T;
  title?: string;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  titleAnimation?: AnimationName;
  titleAnimationDelay?: number;
  content?: string;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  contentVariant?: VariantName;
  hint?: string;
  placeholder?: string;
  validate?: (value: any) => boolean | string | Promise<boolean | string>;
  // defaultValue?: string | string[] | number | boolean;
  defaultColor?: ColorName;
  defaultTypography?: TypographyName;
  choices?: ChoiceOptions[];
  variantOptions?: {
    box?: {
      limit?: number;
    };
  };
  action?: () => Promise<void>;
  border?: boolean;
  borderColor?: ColorName;
  additionalLinesToDelete?: number;
  hintColor?: ColorName;
  hints?: string[];
  required?: boolean;
  initial?: any[];
  endTitle?: string;
  endTitleColor?: ColorName;
};

export type ChoiceRequiredOptions = {
  id: string;
  title: string;
};

export type ChoiceOptionalOptions = {
  description?: string;
  titleTypography?: TypographyName;
  action?: () => Promise<void>;
};

export type ChoiceOptions = ChoiceRequiredOptions & ChoiceOptionalOptions;

export type PromptType =
  | "text"
  | "number"
  | "confirm"
  | "numSelect"
  | "select"
  | "multiselect"
  | "password"
  | "date"
  | "start"
  | "nextSteps"
  | "end";
