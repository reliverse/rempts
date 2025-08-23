// AUTO-GENERATED AGGREGATOR START (via `dler agg`)
export { animateText, animationMap } from "./libs/animate/animate-mod";
export { anykeyPrompt } from "./libs/anykey/anykey-mod";
export type { CancelValue } from "./libs/cancel/cancel";
export {
  block,
  CANCEL,
  cancel,
  createCancel,
  getColumns,
  isCancel,
  isWindows,
  setRawMode,
} from "./libs/cancel/cancel";
export { confirm } from "./libs/confirm/confirm-alias";
export { confirmPrompt } from "./libs/confirm/confirm-mod";
export { datePrompt } from "./libs/date/date";
export { startEditor } from "./libs/editor/editor-mod";
export {
  fallbackSymbols,
  figures,
  mainSymbols,
} from "./libs/figures/figures-mod";
export type {
  GroupContext,
  GroupOptions,
  GroupStep,
  GroupSteps,
} from "./libs/group/group-mod";
export { createMultiStep, createStep, group } from "./libs/group/group-mod";
export { input, password, text } from "./libs/input/input-alias";
export { inputPrompt } from "./libs/input/input-mod";
export { intro, startPrompt } from "./libs/intro/intro-alias";
export { introPrompt } from "./libs/intro/intro-mod";
export { loadCommand } from "./libs/launcher/command-runner";
export {
  argsToStringArray,
  callCmdImpl,
  createCallCmd,
  createGetTypedCmd,
  getTypedCmdImpl,
} from "./libs/launcher/command-typed";
export { runMain } from "./libs/launcher/launcher-alias";
export {
  createCli,
  defineArgs,
  defineCommand,
  runCmd,
  runCmdWithSubcommands,
  showUsage,
} from "./libs/launcher/launcher-mod";
export type {
  ArgDefinition,
  ArgDefinitions,
  ArrayArgDefinition,
  BaseArgDefinition,
  BaseArgProps,
  BooleanArgDefinition,
  Command,
  CommandContext,
  CommandHook,
  CommandMeta,
  CommandRun,
  CommandSpec,
  CommandsMap,
  DefineCommandOptions,
  EmptyArgs,
  FileBasedOptions,
  InferArgTypes,
  NumberArgDefinition,
  PositionalArgDefinition,
  StringArgDefinition,
} from "./libs/launcher/launcher-types";
export { addCompletions } from "./libs/launcher/trpc-orpc-support/completions";
export {
  CliValidationError,
  FailedToExitError,
} from "./libs/launcher/trpc-orpc-support/errors";
export {
  createRpcCli,
  parseRouter,
  TrpcCommand,
  trpcServer,
  z,
  zod,
} from "./libs/launcher/trpc-orpc-support/index";
export type { CommandJSON } from "./libs/launcher/trpc-orpc-support/json";
export { commandToJSON } from "./libs/launcher/trpc-orpc-support/json";
export {
  flattenedProperties,
  getDescription,
  getEnumChoices,
  getSchemaTypes,
  incompatiblePropertyPairs,
} from "./libs/launcher/trpc-orpc-support/json-schema";
export {
  lineByLineConsoleLogger,
  lineByLineLogger,
} from "./libs/launcher/trpc-orpc-support/logging";
export { parseProcedureInputs } from "./libs/launcher/trpc-orpc-support/parse-procedure";
export {
  createShadowCommand,
  promptify,
} from "./libs/launcher/trpc-orpc-support/prompts";
export type {
  StandardSchemaV1,
  StandardSchemaV1FailureResult,
  StandardSchemaV1InferInput,
  StandardSchemaV1InferOutput,
  StandardSchemaV1Issue,
  StandardSchemaV1PathSegment,
  StandardSchemaV1Props,
  StandardSchemaV1Result,
  StandardSchemaV1SuccessResult,
  StandardSchemaV1Types,
} from "./libs/launcher/trpc-orpc-support/standard-schema/contract";
export {
  prettifyStandardSchemaError,
  StandardSchemaV1Error,
  toDotPath,
} from "./libs/launcher/trpc-orpc-support/standard-schema/errors";
export {
  looksLikeStandardSchema,
  looksLikeStandardSchemaFailure,
} from "./libs/launcher/trpc-orpc-support/standard-schema/utils";
export type {
  AnyProcedure,
  AnyRouter,
  CreateCallerFactoryLike,
  inferRouterContext,
  OrpcProcedureLike,
  OrpcRouterLike,
  Trpc10ProcedureLike,
  Trpc10RouterLike,
  Trpc11ProcedureLike,
  Trpc11ProcedureRecordLike,
  Trpc11RouterLike,
} from "./libs/launcher/trpc-orpc-support/trpc-compat";
export {
  isOrpcRouter,
  isTrpc11Procedure,
  isTrpc11Router,
} from "./libs/launcher/trpc-orpc-support/trpc-compat";
export type {
  ClackPromptsLike,
  CommanderProgramLike,
  Dependencies,
  EnquirerLike,
  InquirerPromptOptions,
  InquirerPromptsLike,
  Log,
  Logger,
  OmeletteInstanceLike,
  ParsedProcedure,
  Promptable,
  PromptContext,
  Prompter,
  PromptsLike,
  Result,
  TrpcCli,
  TrpcCliMeta,
  TrpcCliParams,
  TrpcCliRunParams,
  TrpcServerModuleLike,
} from "./libs/launcher/trpc-orpc-support/types";
export { looksLikeInstanceof } from "./libs/launcher/trpc-orpc-support/util";
export { log } from "./libs/log/log-alias";
export { toBaseColor, toSolidColor } from "./libs/msg-fmt/colors";
export {
  relinkaAsyncByRemptsDeprecated,
  relinkaByRemptsDeprecated,
  throwError,
} from "./libs/msg-fmt/logger";
export { colorMap, typographyMap } from "./libs/msg-fmt/mapping";
export {
  bar,
  fmt,
  msg,
  msgUndo,
  msgUndoAll,
  printLineBar,
  symbols,
} from "./libs/msg-fmt/messages";
export {
  breakLines,
  countLines,
  deleteLastLine,
  deleteLastLines,
  getExactTerminalWidth,
  getTerminalHeight,
  getTerminalWidth,
  removeCursor,
  restoreCursor,
} from "./libs/msg-fmt/terminal";
export {
  applyVariant,
  isValidVariant,
  variantMap,
} from "./libs/msg-fmt/variants";
export { multiselect } from "./libs/multiselect/multiselect-alias";
export { multiselectPrompt } from "./libs/multiselect/multiselect-prompt";
export { nextStepsPrompt } from "./libs/next-steps/next-steps";
export { numberPrompt } from "./libs/number/number-mod";
export { endPrompt, outro } from "./libs/outro/outro-alias";
export { outroPrompt } from "./libs/outro/outro-mod";
export type { ResultsType } from "./libs/results/results";
export { resultPrompt } from "./libs/results/results";
export { numMultiSelectPrompt } from "./libs/select/nummultiselect-prompt";
export { numSelectPrompt } from "./libs/select/numselect-prompt";
export { select, selectSimple } from "./libs/select/select-alias";
export { selectPrompt } from "./libs/select/select-prompt";
export { togglePrompt } from "./libs/select/toggle-prompt";
export { spinner } from "./libs/spinner/spinner-alias";
export { useSpinner } from "./libs/spinner/spinner-mod";
export { taskProgressPrompt } from "./libs/task/progress";
export { taskSpinPrompt } from "./libs/task/task-spin";
export { colorize } from "./libs/utils/colorize";
export { errorHandler } from "./libs/utils/errors";
export {
  preventUnsupportedTTY,
  preventWindowsHomeDirRoot,
  preventWrongTerminalSize,
} from "./libs/utils/prevent";
export {
  completePrompt,
  renderEndLine,
  renderEndLineInput,
} from "./libs/utils/prompt-end";
export {
  streamText,
  streamTextBox,
  streamTextWithSpinner,
} from "./libs/utils/stream-text";
export { pm, reliversePrompts } from "./libs/utils/system";
export {
  isTerminalInteractive,
  isValidName,
  normalizeName,
} from "./libs/utils/validate";
export { createAsciiArt } from "./libs/visual/visual-mod";
export type {
  AllKinds,
  BorderColorName,
  ChoiceOptions,
  ColorName,
  ConfirmPromptOptions,
  DatePromptOptions,
  EditorExitResult,
  FmtMsgOptions,
  InputPromptOptions,
  MessageConfig,
  MessageKind,
  MsgConfig,
  MsgType,
  MultiselectPromptParams,
  OutputColor,
  PreventWrongTerminalSizeOptions,
  ProgressBar,
  ProgressBarOptions,
  PromptOptions,
  PromptType,
  RenderParams,
  SelectOption,
  SelectPromptParams,
  SeparatorOption,
  StandardColor,
  StreamOptions,
  StreamTextOptions,
  SymbolName,
  Symbols,
  TogglePromptParams,
  TypographyName,
  VariantName,
} from "./types";
// AUTO-GENERATED AGGREGATOR END
