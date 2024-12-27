import MuteStream from "mute-stream";
import { AsyncResource } from "node:async_hooks";
import * as readline from "node:readline";
import { onExit as onSignalExit } from "signal-exit";

import { type Prompt, type PromptConfig } from "~/types/index.js";
import { type BetterReadline } from "~/types/index.js";

import {
  AbortPromptError,
  CancelPromptError,
  ExitPromptError,
  NonInteractiveError,
} from "./errors.js";
import { withHooks, effectScheduler } from "./hook-engine.js";
import { PromisePolyfill } from "./promise-polyfill.js";
import ScreenManager from "./screen-manager.js";

type ViewFunction<Value, Config> = (
  config: Config,
  done: (value: Value) => void,
) => string | [string, string | undefined];

function getCallSites() {
  const _prepareStackTrace = Error.prepareStackTrace;
  try {
    let result: NodeJS.CallSite[] = [];
    Error.prepareStackTrace = (_, callSites) => {
      const callSitesWithoutCurrent = callSites.slice(1);
      result = callSitesWithoutCurrent;
      return callSitesWithoutCurrent;
    };

    new Error().stack;
    return result;
  } finally {
    Error.prepareStackTrace = _prepareStackTrace;
  }
}

export function createPrompt<Value, Config>(view: ViewFunction<Value, Config>) {
  const callerFilename = getCallSites()[0]?.getFileName() ?? "unknown";

  const prompt: Prompt<Value, Config & PromptConfig> = (
    config,
    context = {},
  ) => {
    // Default `input` to stdin
    const { input = process.stdin, signal, nonInteractive = false } = context;
    const cleanups = new Set<() => void>();

    // Check if terminal is interactive
    if (nonInteractive || !("isTTY" in input && input.isTTY)) {
      // In non-interactive mode, generate prompts.json with default values or placeholders
      const promptsJson = {
        type: "prompts",
        message:
          "Please fill this file and run the CLI again to continue with your terminal, which doesn't support interactivity (or use tty-supported terminal)",
        prompts: [
          {
            name: "value",
            message: config.message || "Input required",
            type: "input",
            default: config.default || "",
          },
        ],
      };

      console.log(JSON.stringify(promptsJson, null, 2));
      throw new NonInteractiveError(
        "Terminal does not support interactivity. A prompts.json file has been generated.",
      );
    }

    // Add mute capabilities to the output
    const output = new MuteStream();
    output.pipe(context.output ?? process.stdout);

    const rl = readline.createInterface({
      terminal: true,
      input,
      output,
    }) as unknown as BetterReadline;
    const screen = new ScreenManager(rl);

    const { promise, resolve, reject } = PromisePolyfill.withResolver<Value>();
    /** @deprecated pass an AbortSignal in the context options instead. */
    const cancel = () => {
      reject(new CancelPromptError());
    };

    if (signal) {
      const abort = () => {
        reject(new AbortPromptError({ cause: signal.reason }));
      };
      if (signal.aborted) {
        abort();
        return Object.assign(promise, { cancel });
      }
      signal.addEventListener("abort", abort);
      cleanups.add(() => {
        signal.removeEventListener("abort", abort);
      });
    }

    cleanups.add(
      onSignalExit((code, signal) => {
        reject(
          new ExitPromptError(
            `User force closed the prompt with ${code} ${signal}`,
          ),
        );
      }),
    );

    // Re-renders only happen when the state change; but the readline cursor could change position
    // and that also requires a re-render (and a manual one because we mute the streams).
    // We set the listener after the initial workLoop to avoid a double render if render triggered
    // by a state change sets the cursor to the right position.
    const checkCursorPos = () => {
      screen.checkCursorPos();
    };
    rl.input.on("keypress", checkCursorPos);
    cleanups.add(() => rl.input.removeListener("keypress", checkCursorPos));

    return withHooks(rl, (cycle) => {
      // The close event triggers immediately when the user press ctrl+c. SignalExit on the other hand
      // triggers after the process is done (which happens after timeouts are done triggering.)
      // We triggers the hooks cleanup phase on rl `close` so active timeouts can be cleared.
      const hooksCleanup = AsyncResource.bind(() => {
        effectScheduler.clearAll();
      });
      rl.on("close", hooksCleanup);
      cleanups.add(() => {
        rl.removeListener("close", hooksCleanup);
      });

      cycle(() => {
        try {
          const nextView = view(config, (value) => {
            setImmediate(() => {
              resolve(value);
            });
          });

          // Typescript won't allow this, but not all users rely on typescript.

          if (nextView === undefined) {
            throw new Error(
              `Prompt functions must return a string.\n    at ${callerFilename}`,
            );
          }

          const [content, bottomContent] =
            typeof nextView === "string" ? [nextView] : nextView;
          screen.render(content, bottomContent);

          effectScheduler.run();
        } catch (error: unknown) {
          reject(error);
        }
      });

      return Object.assign(
        promise
          .then(
            (answer) => {
              effectScheduler.clearAll();
              return answer;
            },
            (error: unknown) => {
              effectScheduler.clearAll();
              throw error;
            },
          )
          // Wait for the promise to settle, then cleanup.
          .finally(() => {
            cleanups.forEach((cleanup) => {
              cleanup();
            });

            screen.done({ clearContent: Boolean(context.clearPromptOnDone) });
            output.end();
          })
          // Once cleanup is done, let the expose promise resolve/reject to the internal one.
          .then(() => promise),
        { cancel },
      );
    });
  };

  return prompt;
}

export type PromptOptions = {
  analytics?: {
    enabled?: boolean;
    askConsent?: boolean;
    dataCollection?: string[];
  };
};
