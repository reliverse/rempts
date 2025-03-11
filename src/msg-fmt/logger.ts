import { streamText, streamTextWithSpinner } from "~/utils/stream-text.js";

import { toSolidColor } from "./colors.js";
import { msg } from "./messages.js";

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

const verboseLogging = false;

const MESSAGE_CONFIGS: Record<MessageKind, MessageConfig> = {
  log: {
    type: "M_INFO",
    titleColor: "retroGradient",
    titleTypography: "bold",
  },
  info: {
    type: "M_INFO",
    titleColor: "retroGradient",
    titleTypography: "bold",
  },
  success: {
    type: "M_INFO",
    titleColor: "viceGradient",
    titleTypography: "bold",
  },
  warn: {
    type: "M_ERROR",
    titleColor: "yellowBright",
    titleTypography: "bold",
  },
  error: {
    type: "M_ERROR",
    titleColor: "yellowBright",
    titleTypography: "bold",
  },
};

/**
 * Logs messages with configurable styling and formatting.
 * Doesn't support streaming functionality.
 */
export function relinka(
  kind: AllKinds,
  title: string,
  content?: string,
  hint?: string,
): void {
  const isVerbose = kind.endsWith("-verbose");
  const baseKind = (
    isVerbose ? kind.replace("-verbose", "") : kind
  ) as MessageKind;

  if (isVerbose && !verboseLogging) {
    return;
  }

  const config = MESSAGE_CONFIGS[baseKind];
  msg({
    ...config,
    title: isVerbose ? `[debug] ${title}` : title,
    content: content ?? "",
    contentColor: "dim",
    contentTypography: "italic",
    hint: hint ?? "",
  });
}

/**
 * Asynchronous version of relinka that supports streaming functionality.
 * Use this when you want animated text output with optional spinner.
 *
 * Streaming is controlled by the streamOpts parameter:
 * - Use { useSpinner: true } for spinner animation
 * - Use { delay: number } for character-by-character streaming
 * - Content and hint are optional regardless of streaming
 */
export const relinkaAsync = async (
  kind: AllKinds,
  title: string,
  content?: string,
  hint?: string,
  streamOpts?: StreamOptions,
): Promise<void> => {
  const isVerbose = kind.endsWith("-verbose");
  const baseKind = (
    isVerbose ? kind.replace("-verbose", "") : kind
  ) as MessageKind;

  if (isVerbose && !verboseLogging) {
    return;
  }

  const config = MESSAGE_CONFIGS[baseKind];

  if (!streamOpts) {
    msg({
      ...config,
      title: isVerbose ? `[debug] ${title}` : title,
      content: content ?? "",
      contentColor: "dim",
      contentTypography: "italic",
      hint: hint ?? "",
    });
    return;
  }

  // Stream the title first
  const titleText = isVerbose ? `[debug] ${title}` : title;
  if (streamOpts.useSpinner) {
    await streamTextWithSpinner({
      text: titleText,
      color: toSolidColor(config.titleColor),
      delay: streamOpts.delay,
      spinnerFrames: streamOpts.spinnerFrames,
      spinnerDelay: streamOpts.spinnerDelay,
    });
  } else {
    await streamText({
      text: titleText,
      color: toSolidColor(config.titleColor),
      delay: streamOpts.delay,
    });
  }

  // Stream content if present
  if (content) {
    await streamText({
      text: content,
      color: toSolidColor(config.contentColor) ?? "dim",
      delay: streamOpts.delay,
    });
  }

  // Stream hint if present
  if (hint) {
    await streamText({
      text: hint,
      color: "dim",
      delay: streamOpts.delay,
    });
  }
};

export const throwError = (error: unknown): never => {
  msg({
    type: "M_ERROR",
    title:
      error instanceof Error
        ? `🤔 Failed to set up the project: ${error.message}`
        : "🤔 An unknown error occurred.",
  });

  process.exit(1);
};
