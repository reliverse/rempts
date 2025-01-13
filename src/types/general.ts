import type { AnimationName } from "@figliolia/chalk-animation";
import type {
  BorderColorName,
  ColorName,
  TypographyName,
  VariantName,
} from "@reliverse/relinka";
import type { TSchema } from "@sinclair/typebox";

export type State = "initial" | "active" | "cancel" | "submit" | "error";

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
  borderColor?: BorderColorName;
  additionalLinesToDelete?: number;
  hintPlaceholderColor?: ColorName;
  hints?: string[];
  required?: boolean;
  initial?: any[];
  endTitle?: string;
  endTitleColor?: ColorName;
  horizontalLine?: boolean;
  horizontalLineLength?: number;
  symbol?: string;
  customSymbol?: string;
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
