/**
 * This command demonstrates the advanced usage of launcher features along with all supported argument types:
 * - Comprehensive Argument Parsing: Supports positional, boolean, string, number, and array arguments.
 * - Interactive Prompts: Uses built-in prompt functions for an engaging CLI experience.
 */

import { relinka } from "@reliverse/relinka";

import {
  defineArgs,
  defineCommand,
  inputPrompt,
  multiselectPrompt,
  startPrompt,
} from "~/mod.js";

const setupArgs = defineArgs({
  // 1. Array argument
  tags: {
    type: "array",
    options: ["cli", "rempts"], // TODO: ensure user can specify own options, not only these
    default: ["cli", "rempts"], // TODO: maybe `default` is redundant with `options`...
    description: "List of tags associated with the project.",
  },
  frameworks: {
    type: "array",
    options: ["next", "svelte", "start"],
    default: ["next", "svelte"],
    description: "List of frameworks associated with the project.",
  },

  // 2. Boolean arguments
  dev: {
    type: "boolean",
    description: "Run CLI in dev mode",
  },
  verbose: {
    type: "boolean",
    default: false,
    description: "Whether to print verbose logs in the main command.",
  },
  debug: {
    type: "boolean",
    default: false,
    description: "Enable debug mode for additional logging.",
  },

  // 3. Number argument
  timeout: {
    type: "number",
    default: 30,
    description: "Timeout in seconds for the CLI operation.",
  },

  // 4. Positional arguments
  inputFile: {
    type: "positional",
    description: "Path to the input file (only for the main command).",
  },
  config: {
    type: "positional",
    description: "Path to the configuration file.",
  },

  // 5. String argument
  name: {
    type: "string",
    description: "The name of the project.",
  },
});

type FrameworkOption = "next" | "svelte" | "start";
// type FrameworkOption = (typeof setupArgs.frameworks.options)[number];

export default defineCommand({
  meta: {
    name: "e-setup",
    version: "1.0.0",
    description: "An example CLI command that supports all argument types.",
  },
  args: setupArgs, // Use the defined args object
  async run({ args, raw }) {
    // args are inferred based on setupArgs. args.frameworks might be readonly.
    // We need a mutable variable to potentially hold the prompt result.
    let selectedFrameworks: string[] = args.frameworks;

    // Display invocation details and parsed arguments.
    relinka("verbose", "Example `setup` was invoked!");
    relinka("verbose", "Parsed main-command args:", args);
    relinka("verbose", "Raw argv:", raw);
    relinka("verbose", "\nHelp: `rempts --help`, `rempts cmdName --help`");

    // Clear the terminal and print a welcome message.
    await startPrompt({
      title: "🚀 Project Setup",
    });

    // Ask for the project name, falling back to provided argument or a default.
    let projectName = args.name;
    if (!projectName) {
      projectName = await inputPrompt({
        title: "What's your project name?",
        placeholder: "my-cool-cli",
      });
    }

    // Let the user pick a framework from a select prompt.
    if (!selectedFrameworks || selectedFrameworks.length === 0) {
      selectedFrameworks = await multiselectPrompt<FrameworkOption>({
        title: "Pick your favorite frameworks",
        options: [
          { value: "next", label: "Next.js" },
          { value: "svelte", label: "SvelteKit" },
          { value: "start", label: "TanStack Start" },
        ],
        defaultValue: ["next", "start"],
      });
    }

    // Log all gathered input details.
    relinka("info", "You have selected:", {
      projectName,
      frameworks: selectedFrameworks,
      inputFile: args.inputFile,
      config: args.config,
      verbose: args.verbose,
      debug: args.debug,
      timeout: args.timeout,
      tags: args.tags,
    });
  },
});
