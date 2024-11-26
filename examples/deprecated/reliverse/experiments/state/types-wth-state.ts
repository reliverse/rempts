import type { TSchema } from "@sinclair/typebox";

import type {
  ChoiceOptions,
  ColorName,
  PromptType,
  TypographyName,
  VariantName,
} from "~/types/general.js";

export type StateDeprecated =
  | "initial"
  | "active"
  | "completed"
  | "cancel"
  | "submit"
  | "error";

export type PromptOptionsWithState<T extends TSchema = any> = {
  type: PromptType;
  id: string;
  title: string;
  stateCompletedTitle?: string;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  message?: string;
  msgColor?: ColorName;
  msgTypography?: TypographyName;
  msgVariant?: VariantName;
  hint?: string;
  validate?: (value: any) => boolean | string | Promise<boolean | string>;
  default?: any;
  defaultColor?: ColorName;
  defaultTypography?: TypographyName;
  choices?: ChoiceOptions[];
  schema?: T;
  variantOptions?: {
    box?: {
      limit?: number;
    };
  };
  repeatBarAfterStart?: number;
  action?: () => Promise<void>;
  state?: StateDeprecated;
};
