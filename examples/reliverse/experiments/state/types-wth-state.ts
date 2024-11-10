import type { TSchema } from "@sinclair/typebox";

import type {
  Choice,
  ColorName,
  PromptType,
  Typography,
  Variant,
} from "~/types";

export type State =
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
  repeatBarAfterStart?: number;
  action?: () => Promise<void>;
  state?: State;
};
