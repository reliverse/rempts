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

export type AnimationName =
  | "rainbow"
  | "pulse"
  | "glitch"
  | "radar"
  | "neon"
  | "karaoke";

export type VariantName = "doubleBox" | "none";

export type MsgConfig = {
  symbol: string;
  prefix?: string;
  color?: (text: string) => string;
  newLineBefore?: boolean;
  newLineAfter?: boolean;
  suffix?: string;
};

export type PromptOptions = {
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

export type SelectOption<T> = {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
};

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

export type EditorExitResult = {
  saved: boolean;
  content: string | null;
  filename: string | null;
};

// ----- Args -----

export type ArgType =
  | "boolean"
  | "string"
  | "number"
  | "enum"
  | "positional"
  | undefined;

// Args: Definition

export type _ArgDef<T extends ArgType, VT extends boolean | number | string> = {
  type?: T;
  description?: string;
  valueHint?: string;
  alias?: string | string[];
  default?: VT;
  required?: boolean;
  options?: (string | number)[];
};

export type BooleanArgDef = Omit<_ArgDef<"boolean", boolean>, "options"> & {
  negativeDescription?: string;
};
export type StringArgDef = Omit<_ArgDef<"string", string>, "options">;
export type NumberArgDef = Omit<_ArgDef<"number", number>, "options">;
export type EnumArgDef = _ArgDef<"enum", string>;
export type PositionalArgDef = Omit<
  _ArgDef<"positional", string>,
  "alias" | "options"
>;

export type ArgDef =
  | BooleanArgDef
  | StringArgDef
  | NumberArgDef
  | PositionalArgDef
  | EnumArgDef;

export type ArgsDef = Record<string, ArgDef>;

export type Arg = ArgDef & { name: string; alias: string[] };

// Args: Parsed

export type Dict<T> = Record<string, T>;
export type Arrayable<T> = T | T[];
export type Default = Dict<any>;

export type ParserOptions = {
  boolean?: Arrayable<string>;
  string?: Arrayable<string>;
  alias?: Dict<Arrayable<string>>;
  default?: Dict<any>;
  unknown?(flag: string): void;
};

export type ParserArgv<T = Default> = T & {
  _: string[];
};

type ResolveParsedArgType<T extends ArgDef, VT> = T extends {
  default?: any;
  required?: boolean;
}
  ? T["default"] extends NonNullable<VT>
    ? VT
    : T["required"] extends true
      ? VT
      : VT | undefined
  : VT | undefined;

type ParsedPositionalArg<T extends ArgDef> = T extends { type: "positional" }
  ? ResolveParsedArgType<T, string>
  : never;

type ParsedStringArg<T extends ArgDef> = T extends { type: "string" }
  ? ResolveParsedArgType<T, string>
  : never;

type ParsedNumberArg<T extends ArgDef> = T extends { type: "number" }
  ? ResolveParsedArgType<T, number>
  : never;

type ParsedBooleanArg<T extends ArgDef> = T extends { type: "boolean" }
  ? ResolveParsedArgType<T, boolean>
  : never;

type ParsedEnumArg<T extends ArgDef> = T extends {
  type: "enum";
  options: infer U;
}
  ? U extends any[]
    ? ResolveParsedArgType<T, U[number]>
    : never
  : never;

type RawArgs = {
  _: string[];
};

// prettier-ignore
type ParsedArg<T extends ArgDef> = T["type"] extends "positional"
  ? ParsedPositionalArg<T>
  : T["type"] extends "boolean"
    ? ParsedBooleanArg<T>
    : T["type"] extends "string"
      ? ParsedStringArg<T>
      : T["type"] extends "number"
        ? ParsedNumberArg<T>
        : T["type"] extends "enum"
          ? ParsedEnumArg<T>
          : never;

// prettier-ignore
export type ParsedArgs<T extends ArgsDef = ArgsDef> = RawArgs & {
  [K in keyof T]: ParsedArg<T[K]>;
} & {
  [K in keyof T as T[K] extends { alias: string }
    ? T[K]["alias"]
    : never]: ParsedArg<T[K]>;
} & {
  [K in keyof T as T[K] extends { alias: string[] }
    ? T[K]["alias"][number]
    : never]: ParsedArg<T[K]>;
} & Record<string, string | number | boolean | string[]>;

// ----- Command -----

// Command: Run Command

export type RunCommandOptions = {
  rawArgs: string[];
  data?: any;
  showUsage?: boolean;
};

// Command: Shared

export type CommandMeta = {
  name?: string;
  version?: string;
  description?: string;
  hidden?: boolean;
};

// Command: Definition

export type SubCommandsDef = Record<string, Resolvable<CommandDef<any>>>;

export type CommandDef<T extends ArgsDef = ArgsDef> = {
  meta?: Resolvable<CommandMeta>;
  args?: Resolvable<T>;
  subCommands?: Resolvable<SubCommandsDef>;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  setup?: (context: CommandContext<T>) => any | Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  cleanup?: (context: CommandContext<T>) => any | Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  run?: (context: CommandContext<T>) => any | Promise<any>;
};

export type CommandContext<T extends ArgsDef = ArgsDef> = {
  rawArgs: string[];
  args: ParsedArgs<T>;
  cmd: CommandDef<T>;
  subCommand?: CommandDef<T>;
  data?: any;
};

// ----- Utils -----

export type Awaitable<T> = () => T | Promise<T>;
export type Resolvable<T> = T | Promise<T> | (() => T) | (() => Promise<T>);

// --- Logger ---

export type MessageKind = "log" | "info" | "warn" | "error" | "success";
export type VerboseKind = `${MessageKind}-verbose`;
export type AllKinds = MessageKind | VerboseKind;
export type MessageConfig = {
  type: "M_INFO" | "M_ERROR";
  titleColor?: "retroGradient" | "viceGradient" | "yellowBright";
  titleTypography?: "bold";
  contentColor?: "dim";
  contentTypography?: "italic";
};

export type StreamOptions = {
  delay?: number;
  useSpinner?: boolean;
  spinnerFrames?: string[];
  spinnerDelay?: number;
};

// --- Progress ---

export type ProgressBarOptions = {
  total: number;
  width?: number;
  completeChar?: string;
  incompleteChar?: string;
  format?: string;
  colorize?: boolean;
  increment?: number;
  desiredTotalTime?: number;
};

export type ProgressBar = {
  update: (value: number) => Promise<void>;
  increment: (amount?: number) => Promise<void>;
  render: () => Promise<void>;
};

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

export type ConfirmPromptOptions = {
  title: string;
  defaultValue?: boolean;
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
};

// --- Stream Text ---

export type StreamTextOptions = {
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
   * Whether to add a newline at the end
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
};

// --- Prevent ---

export type PreventWrongTerminalSizeOptions = {
  isDev?: boolean;
  shouldExit?: boolean;
  minWidth?: number;
  minHeight?: number;
  sizeErrorDescription?: string;
};

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
  endTitle?: string;
  endTitleColor?: ColorName;
  hardcoded?: {
    userInput?: string;
    errorMessage?: string;
    showPlaceholder?: boolean;
  };
  hint?: string;
  hintPlaceholderColor?: ColorName;
  mode?: "plain" | "password";
  mask?: string;
  placeholder?: string;
  schema?: any;
  shouldStream?: boolean;
  streamDelay?: number;
  symbol?: SymbolName;
  symbolColor?: ColorName;
  title: string;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  validate?: (
    value: string,
  ) => string | boolean | undefined | Promise<string | boolean | undefined>;
  variantOptions?: unknown;
} & PromptOptions;

export type RenderParams = {
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
  title: string;
  titleColor?: ColorName;
  titleTypography?: TypographyName;
  titleVariant?: VariantName;
  userInput: string;
  isRerender?: boolean;
};

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
  | "info"
  | "success";

export type Symbols = Record<SymbolName, string>;

export type FmtMsgOptions = {
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
};

// --- Toggle Prompt ---

export type TogglePromptParams<T extends string> = {
  title: string;
  content?: string;
  options?: [T, T];
  defaultValue?: T;
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
};

// --- Multiselect Prompt ---

export type SeparatorOption = {
  separator: true;
  width?: number;
  symbol?: SymbolName;
};

export type MultiselectPromptParams<T extends string> = {
  title: string;
  content?: string;
  options: (SelectOption<T> | SeparatorOption)[];
  defaultValue?: T[];
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
  minSelect?: number;
  maxSelect?: number;
  selectAll?: boolean;
};

// --- Date Prompt ---

export type DatePromptOptions = PromptOptions & {
  dateFormat: string; // Description of accepted date formats
  dateKind: "birthday" | "other"; // Type of date for additional validation
  defaultValue?: string;
  endTitle?: string;
  endTitleColor?: ColorName;
  border?: boolean;
};
