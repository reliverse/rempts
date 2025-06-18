// AUTO-GENERATED AGGREGATOR START (via `dler agg`)
export {
  password,
  multiselect,
  select,
  confirm,
  input,
  text,
  startPrompt,
  intro,
  endPrompt,
  outro,
  spinner,
} from "./components/aliases/aliases-mod.js";
export { animationMap, animateText } from "./components/animate/animate.js";
export { anykeyPrompt } from "./components/anykey/anykey-mod.js";
export { createAsciiArt } from "./components/ascii-art/ascii-art.js";
export type { CancelValue } from "./components/cancel/cancel.js";
export {
  CANCEL,
  isWindows,
  setRawMode,
  getColumns,
  block,
  isCancel,
  cancel,
  createCancel,
} from "./components/cancel/cancel.js";
export { confirmPrompt } from "./components/confirm/confirm-prompt.js";
export { datePrompt } from "./components/date/date.js";
export { startEditor } from "./components/editor/editor-mod.js";
export {
  figures,
  mainSymbols,
  fallbackSymbols,
} from "./components/figures/figures-mod.js";
export { inputPrompt } from "./components/input/input-prompt.js";
export { introPrompt } from "./components/intro/intro-start.js";
export {
  defineCommand,
  showUsage,
  runMain,
  defineArgs,
  runCmd,
} from "./components/launcher/launcher-mod.js";
export type {
  EmptyArgs,
  BaseArgProps,
  BaseArgDefinition,
  PositionalArgDefinition,
  BooleanArgDefinition,
  StringArgDefinition,
  NumberArgDefinition,
  ArrayArgDefinition,
  ArgDefinition,
  ArgDefinitions,
  CommandMeta,
  CommandSpec,
  CommandsMap,
  CommandContext,
  CommandRun,
  CommandHook,
  DefineCommandOptions,
  Command,
  InferArgTypes,
  FileBasedCmdsOptions,
} from "./components/launcher/launcher-types.js";
export { loadCommand } from "./components/launcher/run-command.js";
export { addCompletions } from "./components/launcher/trpc-orpc-support/completions.js";
export {
  CliValidationError,
  FailedToExitError,
} from "./components/launcher/trpc-orpc-support/errors.js";
export {
  TrpcCommand,
  parseRouter,
  createCli,
  z,
} from "./components/launcher/trpc-orpc-support/index.js";
export {
  flattenedProperties,
  incompatiblePropertyPairs,
  getDescription,
  getSchemaTypes,
  getEnumChoices,
} from "./components/launcher/trpc-orpc-support/json-schema.js";
export type { CommandJSON } from "./components/launcher/trpc-orpc-support/json.js";
export { commandToJSON } from "./components/launcher/trpc-orpc-support/json.js";
export {
  lineByLineLogger,
  lineByLineConsoleLogger,
} from "./components/launcher/trpc-orpc-support/logging.js";
export { parseProcedureInputs } from "./components/launcher/trpc-orpc-support/parse-procedure.js";
export {
  createShadowCommand,
  promptify,
} from "./components/launcher/trpc-orpc-support/prompts.js";
export type {
  StandardSchemaV1,
  StandardSchemaV1Props,
  StandardSchemaV1Result,
  StandardSchemaV1SuccessResult,
  StandardSchemaV1FailureResult,
  StandardSchemaV1Issue,
  StandardSchemaV1PathSegment,
  StandardSchemaV1Types,
  StandardSchemaV1InferInput,
  StandardSchemaV1InferOutput,
} from "./components/launcher/trpc-orpc-support/standard-schema/contract.js";
export {
  prettifyStandardSchemaError,
  toDotPath,
  StandardSchemaV1Error,
} from "./components/launcher/trpc-orpc-support/standard-schema/errors.js";
export {
  looksLikeStandardSchemaFailure,
  looksLikeStandardSchema,
} from "./components/launcher/trpc-orpc-support/standard-schema/utils.js";
export type {
  Trpc11RouterLike,
  Trpc11ProcedureRecordLike,
  Trpc11ProcedureLike,
  Trpc10RouterLike,
  Trpc10ProcedureLike,
  OrpcProcedureLike,
  OrpcRouterLike,
  CreateCallerFactoryLike,
  AnyRouter,
  AnyProcedure,
  inferRouterContext,
} from "./components/launcher/trpc-orpc-support/trpc-compat.js";
export {
  isTrpc11Procedure,
  isTrpc11Router,
  isOrpcRouter,
} from "./components/launcher/trpc-orpc-support/trpc-compat.js";
export type {
  TrpcCliParams,
  TrpcServerModuleLike,
  TrpcCliMeta,
  ParsedProcedure,
  Result,
  Log,
  Logger,
  OmeletteInstanceLike,
  InquirerPromptOptions,
  InquirerPromptsLike,
  PromptsLike,
  EnquirerLike,
  ClackPromptsLike,
  Promptable,
  TrpcCliRunParams,
  CommanderProgramLike,
  TrpcCli,
  Dependencies,
  PromptContext,
  Prompter,
} from "./components/launcher/trpc-orpc-support/types.js";
export { looksLikeInstanceof } from "./components/launcher/trpc-orpc-support/util.js";
export { log } from "./components/log/log.js";
export { toBaseColor, toSolidColor } from "./components/msg-fmt/colors.js";
export {
  relinkaByRemptsDeprecated,
  relinkaAsyncByRemptsDeprecated,
  throwError,
} from "./components/msg-fmt/logger.js";
export { colorMap, typographyMap } from "./components/msg-fmt/mapping.js";
export {
  symbols,
  bar,
  fmt,
  msg,
  msgUndo,
  msgUndoAll,
  printLineBar,
} from "./components/msg-fmt/messages.js";
export {
  getTerminalHeight,
  getExactTerminalWidth,
  getTerminalWidth,
  breakLines,
  removeCursor,
  restoreCursor,
  deleteLastLine,
  deleteLastLines,
  countLines,
} from "./components/msg-fmt/terminal.js";
export {
  variantMap,
  isValidVariant,
  applyVariant,
} from "./components/msg-fmt/variants.js";
export { nextStepsPrompt } from "./components/next-steps/next-steps.js";
export { numberPrompt } from "./components/number/number-mod.js";
export { outroPrompt } from "./components/outro/outro-end.js";
export type { ResultsType } from "./components/results/results.js";
export { resultPrompt } from "./components/results/results.js";
export { multiselectPrompt } from "./components/select/multiselect-prompt.js";
export { numMultiSelectPrompt } from "./components/select/nummultiselect-prompt.js";
export { numSelectPrompt } from "./components/select/numselect-prompt.js";
export { selectPrompt } from "./components/select/select-prompt.js";
export { togglePrompt } from "./components/select/toggle-prompt.js";
export { useSpinner } from "./components/spinner/spinner-mod.js";
export { taskProgressPrompt } from "./components/task/progress.js";
export { taskSpinPrompt } from "./components/task/task-spin.js";
export type {
  MsgType,
  TypographyName,
  BorderColorName,
  ColorName,
  VariantName,
  MsgConfig,
  PromptOptions,
  ChoiceOptions,
  SelectOption,
  StandardColor,
  OutputColor,
  EditorExitResult,
  MessageKind,
  AllKinds,
  MessageConfig,
  StreamOptions,
  ProgressBarOptions,
  ProgressBar,
  PromptType,
  ConfirmPromptOptions,
  StreamTextOptions,
  PreventWrongTerminalSizeOptions,
  InputPromptOptions,
  RenderParams,
  SymbolName,
  Symbols,
  FmtMsgOptions,
  TogglePromptParams,
  SeparatorOption,
  MultiselectPromptParams,
  DatePromptOptions,
} from "./types.js";
export { colorize } from "./utils/colorize.js";
export { errorHandler } from "./utils/errors.js";
export {
  preventUnsupportedTTY,
  preventWindowsHomeDirRoot,
  preventWrongTerminalSize,
} from "./utils/prevent.js";
export {
  completePrompt,
  renderEndLine,
  renderEndLineInput,
} from "./utils/prompt-end.js";
export {
  streamText,
  streamTextBox,
  streamTextWithSpinner,
} from "./utils/stream-text.js";
export { pm, reliversePrompts } from "./utils/system.js";
export {
  isTerminalInteractive,
  isValidName,
  normalizeName,
} from "./utils/validate.js";
// AUTO-GENERATED AGGREGATOR END
