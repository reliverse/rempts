export type MsgType =
  | "M_NULL"
  | "M_INFO_NULL"
  | "M_START"
  | "M_MIDDLE"
  | "M_GENERAL"
  | "M_GENERAL_NULL"
  | "M_INFO"
  | "M_ERROR"
  | "M_ERROR_NULL"
  | "M_END"
  | "M_NEWLINE"
  | "M_BAR";

export type TypographyName =
  | "bold"
  | "strikethrough"
  | "underline"
  | "italic"
  | "none";

export type BorderColorName =
  | "reset"
  | "inverse"
  | "dim"
  | "black"
  | "red"
  | "redBright"
  | "green"
  | "greenBright"
  | "yellow"
  | "yellowBright"
  | "blue"
  | "blueBright"
  | "magenta"
  | "magentaBright"
  | "cyan"
  | "cyanBright"
  | "bgCyan"
  | "bgCyanBright"
  | "white"
  | "gray";

export type ColorName =
  | BorderColorName
  | "gradientGradient"
  | "rainbowGradient"
  | "cristalGradient"
  | "mindGradient"
  | "passionGradient"
  | "viceGradient"
  | "retroGradient"
  | "none";

type AnimationName =
  | "rainbow"
  | "pulse"
  | "glitch"
  | "radar"
  | "neon"
  | "karaoke";

export type VariantName = "doubleBox" | "none";

export interface MsgConfig {
  symbol: string;
  prefix?: string;
  color?: (text: string) => string;
  newLineBefore?: boolean;
  newLineAfter?: boolean;
  suffix?: string;
}

export interface PromptOptions {
  schema?: any;
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
  validate?: (
    value: any,
  ) => boolean | string | undefined | Promise<boolean | string | undefined>;
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
}

interface ChoiceRequiredOptions {
  id: string;
  title: string;
}

interface ChoiceOptionalOptions {
  description?: string;
  titleTypography?: TypographyName;
  action?: () => Promise<void>;
}

export type ChoiceOptions = ChoiceRequiredOptions & ChoiceOptionalOptions;

export interface SelectOption<T> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

/**
 * Standard terminal colors supported by most terminals
 */
export type StandardColor =
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "gray";

/**
 * All possible output colors including special colors
 */
export type OutputColor = StandardColor | "dim";

export interface EditorExitResult {
  saved: boolean;
  content: string | null;
  filename: string | null;
}

// --- Logger ---

export type MessageKind = "log" | "info" | "warn" | "error" | "success";
type VerboseKind = `${MessageKind}-verbose`;
export type AllKinds = MessageKind | VerboseKind;
export interface MessageConfig {
  type: "M_INFO" | "M_ERROR";
  titleColor?: "retroGradient" | "viceGradient" | "yellowBright";
  titleTypography?: "bold";
  contentColor?: "dim";
  contentTypography?: "italic";
}

export interface StreamOptions {
  delay?: number;
  useSpinner?: boolean;
  spinnerFrames?: string[];
  spinnerDelay?: number;
}

// --- Progress ---

export interface ProgressBarOptions {
  total: number;
  width?: number;
  completeChar?: string;
  incompleteChar?: string;
  format?: string;
  colorize?: boolean;
  increment?: number;
  desiredTotalTime?: number;
}

export interface ProgressBar {
  update: (value: number) => Promise<void>;
  increment: (amount?: number) => Promise<void>;
  render: () => Promise<void>;
}

// --- Prompt ---

/**
 * Union type for available prompt types.
 */
export type PromptType =
  | "input"
  | "inputmasked"
  | "select"
  | "multiselect"
  | "nummultiselect"
  | "numselect"
  | "toggle"
  | "confirm"
  | "spinner"
  | "progressbar"
  | "results"
  | "nextsteps"
  | "animatedtext"
  | "date"
  | "end";

// --- Confirm Prompt ---

export interface ConfirmPromptOptions {
  title?: string;
  message?: string; // Alias for title
  defaultValue?: boolean;
  initialValue?: boolean; // Alias for defaultValue
  content?: string;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  contentVariant?: VariantName;
  borderColor?: BorderColorName;
  hintPlaceholderColor?: ColorName;
  variantOptions?: any;
  action?: () => Promise<void>;
  displayInstructions?: boolean;
  debug?: boolean;
  endTitle?: string;
  endTitleColor?: ColorName;
  border?: boolean;
  terminalWidth?: number;
}

// --- Stream Text ---

export interface StreamTextOptions {
  /**
   * Text to stream
   */
  text: string;
  /**
   * Delay between each character in milliseconds
   * @default 50
   */
  delay?: number;
  /**
   * Whether to show cursor while streaming
   * @default false
   */
  showCursor?: boolean;
  /**
   * Color to use for the text
   * @default undefined (no color)
   */
  color?: ColorName;
  /**
   * Whether to inject a newline at the end
   * @default true
   */
  newline?: boolean;
  /**
   * Whether to clear the line before streaming
   * @default false
   */
  clearLine?: boolean;
  /**
   * Callback function to update the spinner text
   */
  onProgress?: (currentText: string) => void;
}

// --- Prevent ---

export interface PreventWrongTerminalSizeOptions {
  isDev?: boolean;
  shouldExit?: boolean;
  minWidth?: number;
  minHeight?: number;
  sizeErrorDescription?: string;
}

// --- Input ---

/**
 * InputPromptOptions
 *
 * Extended options for handling user input prompts, including validation
 * and UI styling. Inherits from PromptOptions.
 */
export type InputPromptOptions = {
  border?: boolean;
  borderColor?: BorderColorName;
  content?: string;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  contentVariant?: VariantName;
  customSymbol?: string;
  defaultValue?: string;
  initialValue?: string; // Alias for defaultValue
  endTitle?: string;
  endTitleColor?: ColorName;
  hardcoded?: {
    userInput?: string;
    errorMessage?: string;
    showPlaceholder?: boolean;
  };
  hint?: string;
  hintPlaceholderColor?: ColorName;
  message?: string; // Alias for title
  mode?: "plain" | "password";
  mask?: string;
  placeholder?: string;
  schema?: any;
  shouldStream?: boolean;
  streamDelay?: number;
  symbol?: SymbolName;
  symbolColor?: ColorName;
  title?: string;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  validate?: (
    value: string,
  ) => string | boolean | undefined | Promise<string | boolean | undefined>;
  variantOptions?: unknown;
} & PromptOptions;

export interface RenderParams {
  border: boolean;
  borderColor?: BorderColorName;
  content?: string;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  contentVariant?: VariantName;
  customSymbol?: string;
  errorMessage: string;
  hint?: string;
  hintPlaceholderColor?: ColorName;
  mask?: string;
  placeholder?: string;
  symbol?: SymbolName;
  symbolColor?: ColorName;
  title?: string;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  userInput: string;
  isRerender?: boolean;
}

// --- Messages ---

/**
 * Known symbol names that will have IntelliSense support
 */
export type SymbolName =
  | "pointer"
  | "start"
  | "middle"
  | "end"
  | "line"
  | "corner_top_right"
  | "step_active"
  | "step_error"
  | "log"
  | "success"
  | "info"
  | "warn"
  | "error";

export type Symbols = Record<SymbolName, string>;

export interface FmtMsgOptions {
  type: MsgType;
  title?: string;
  titleAfterAnim?: string;
  content?: string | undefined;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  contentVariant?: VariantName;
  hint?: string;
  hintPlaceholderColor?: ColorName;
  hintTypography?: TypographyName;
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
  terminalWidth?: number;
  instructions?: string;
  wrapTitle?: boolean;
  wrapContent?: boolean;
  symbol?: SymbolName;
  customSymbol?: string;
  symbolColor?: ColorName;
  noNewLine?: boolean;
}

// --- Toggle Prompt ---

export interface TogglePromptParams<T extends string> {
  title?: string;
  message?: string; // Alias for title
  content?: string;
  options?: [T, T];
  defaultValue?: T;
  initialValue?: T; // Alias for defaultValue
  borderColor?: BorderColorName;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  border?: boolean;
  endTitle?: string;
  endTitleColor?: ColorName;
  displayInstructions?: boolean;
  debug?: boolean;
}

// --- Multiselect Prompt ---

export interface SeparatorOption {
  separator: true;
  width?: number;
  symbol?: SymbolName;
}

export interface SelectPromptParams<T extends string> {
  title?: string;
  message?: string; // Alias for title
  content?: string;
  options?: (SelectOption<T> | SeparatorOption)[];
  optionsArray?: { value: T; label?: string; hint?: string }[]; // Simplified options format
  defaultValue?: T;
  initialValue?: T; // Alias for defaultValue
  required?: boolean; // When true, user must make a selection
  borderColor?: BorderColorName;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  border?: boolean;
  endTitle?: string;
  endTitleColor?: ColorName;
  debug?: boolean;
  terminalWidth?: number;
  displayInstructions?: boolean;
  shouldStream?: boolean;
  streamDelay?: number;
}

export interface MultiselectPromptParams<T extends string> {
  title?: string;
  message?: string; // Alias for title
  content?: string;
  options: (SelectOption<T> | SeparatorOption)[];
  defaultValue?: T[];
  initialValues?: T[]; // Alias for defaultValue
  borderColor?: BorderColorName;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  contentColor?: ColorName;
  contentTypography?: TypographyName;
  border?: boolean;
  endTitle?: string;
  endTitleColor?: ColorName;
  debug?: boolean;
  terminalWidth?: number;
  displayInstructions?: boolean;
  required?: boolean; // When true, minSelect becomes 1
  minSelect?: number;
  maxSelect?: number;
  selectAll?: boolean;
}

// --- Date Prompt ---

export type DatePromptOptions = PromptOptions & {
  dateFormat: string; // Description of accepted date formats
  dateKind: "birthday" | "other"; // Type of date for additional validation
  defaultValue?: string;
  endTitle?: string;
  endTitleColor?: ColorName;
  border?: boolean;
};
