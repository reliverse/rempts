# @reliverse/prompts

[**Docs**](.github/DOCS.md) | [**npmjs.com**](https://npmjs.com/package/@reliverse/prompts) | [**GitHub**](https://github.com/reliverse/prompts) | [**Discord**](https://discord.gg/Pb8uKbwpsJ)

<p align="left">
  <a href="https://npmjs.org/package/@reliverse/prompts">
    <img src="https://img.shields.io/npm/v/@reliverse/prompts.svg" alt="version" />
  </a>
  <!-- <a href="https://github.com/reliverse/prompts/actions/workflows/test.yml">
    <img src="https://github.com/reliverse/prompts/actions/workflows/test.yml/badge.svg" alt="test" />
  </a> -->
  <a href="https://npmjs.org/package/@reliverse/prompts">
    <img src="https://img.shields.io/npm/dm/@reliverse/prompts.svg" alt="downloads" />
  </a>
  <!-- <a href="https://licenses.dev/npm/@reliverse/prompts">
    <img src="https://licenses.dev/b/npm/@reliverse/prompts" alt="licenses" />
  </a> -->
  <!---
   <a href="https://packagephobia.now.sh/result?p=@reliverse/prompts">
    <img src="https://packagephobia.now.sh/badge?p=@reliverse/prompts" alt="install size" />
  </a>
  --->
</p>

@reliverse/prompts is a powerful library that enables seamless, type-safe, and resilient prompts for command-line applications. Crafted with simplicity and elegance, it provides developers with an intuitive and robust way to build interactive CLIs.

@reliverse/prompts is a full-featured alternative to @inquirer/prompts (Inquirer.js), enquirer, @clack/prompts, terkelg prompts, cronvel terminal-kit, unjs consola, and similar libraries.

## Installation

Install with your preferred package manager:

```sh
bun add @reliverse/prompts # Replace 'bun' with npm, pnpm, or yarn if desired (deno and jsr support coming soon)
```

## Screenshot

[![CLI Example](./example.png)](./example.png)

## Key Features

- **Type Safety**: Built with TypeScript, ensuring strong typing to prevent runtime errors.
- **Schema Validation**: Validates user inputs using schemas for enhanced reliability.
- **Flexible Prompt Types**: Supports a range of prompt types, including text, password, number, select, and multiselect.
- **Crash Resilience**: Designed to handle cancellations and errors gracefully, ensuring stability.

## Prompt Types

Each type has its own validation and display logic. More types are planned for future releases.

- **Text**: Collects text input.
- **Password**: Hidden input for secure password entries.
- **Number**: Numeric input with optional validation.
- **Confirm**: Simple Yes/No prompt.
- **Select**: Dropdown selection for multiple choices.
- **Multiselect**: Allows users to select multiple items from a list.

## Input Validation

All prompts support custom validation logic, providing immediate feedback to users.

## Contributing

@reliverse/prompts is a work in progress. We welcome feedback and contributions to help make it the best library it can be. Thank you!

Here is how to install the library for development:

```sh
git clone https://github.com/reliverse/prompts.git
cd prompts
bun i
```

## Playground

Run `bun dev` to launch the [examples/launcher.ts](./examples/launcher.ts) CLI, which helps you to dive into and explore any of the examples listed below. Experiment with @reliverse/prompts by running examples locally or reviewing the linked code:

1. **[1-main.ts](./examples/1-main.ts)**: A comprehensive example of a CLI application featuring a well styled UI config. This example showcases all available prompt components, with code organized into separate functions and files for better readability and clarity.
2. **[2-mono.ts](./examples/2-mono.ts)**: A quiz game example inspired by Fireship's video about CLIs. It demonstrates the dynamic capabilities of @reliverse/prompts by using a prompt() that includes all prompt components, so you don't need to import each component separately.
3. **[3-simple.ts](./examples/3-simple.ts)**: A simple example highlighting the core functionalities of @reliverse/prompts. The entire implementation is contained within a single file for easy understanding.
4. **[4-args-a.ts](./examples/4-args-a.ts)**: An example of how to run commands using arguments.
5. **[5-args-b.ts](./examples/5-args-b.ts)**: Another example of how to run commands using arguments.

## Extendable Configuration

**Example Configuration:**

```typescript
const basicConfig = {
  titleColor: "cyanBright",
  titleTypography: "bold",
  borderColor: "viceGradient",
} satisfies PromptOptions;

const extendedConfig = {
  ...basicConfig,
  contentTypography: "italic",
  contentColor: "dim",
} satisfies PromptOptions;

const username = await inputPrompt({
  id: "username",
  title: "We're glad you're testing our library!",
  content: "Let's get to know each other!\nWhat's your username?",
  schema: schema.properties.username,
  ...extendedConfig,
});
```

## Mono Component

The Mono Component is a special component that includes all other components. It's a great way to get started quickly or to see how all the components work together.

This component requires providing prompt id. To have typesafety use something like the following:

```ts
export const IDs = {
  start: "start",
  username: "username",
  dir: "dir",
  spinner: "spinner",
  password: "password",
  age: "age",
  lang: "lang",
  color: "color",
  birthday: "birthday",
  features: "features",
};
```

## Prompts Library Comparison

> **Note:** This table contains approximate and placeholder values. More detailed assessments will be provided as libraries continue to evolve.

The mission of @reliverse/prompts is to achieve the 🟢 in all categories.

**Icon Legend:**

- 🟡: Not yet verified
- 🟢: Fully supported
- 🔵: Partially supported
- 🔴: Not supported

| **Feature**                                              | **@reliverse/prompts**                                         | **@inquirer/prompts**                      | **@enquirer/enquirer** | **@clack/prompts** | **@terkelg/prompts** | **@cronvel/terminal-kit** | **@unjs/citty** | **@unjs/consola**  | **@chjj/blessed** |
| -------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------ | ---------------------- | ------------------ | -------------------- | ------------------------- | --------------- | ------------------ | ----------------- |
| - Full ES Modules Support                                | 🟢 Native ES module package                                    | 🟢                                        | 🟡                     | 🟡                 | 🔴 CJS-only          | 🔴 CJS-only             | 🟢              | 🟢                | 🟡                |
| - Works both in node, bun, and deno environments         | 🔵 node+bun (deno support is coming soon)                      | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🔵              | 🔵                | 🟡                |
| - Codebase typesafety with intellisense                  | 🔵                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Runtime typesafety with schema validation              | 🟢 TypeBox & Custom                                            | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Usage Examples                                         | 🟢                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Customization                                          | 🟢 Colors, typography, variants, borders, and more             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Custom Validation                                      | 🔵                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Error Handling                                         | 🔵                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Ease of Setup                                          | 🔵                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Crash Resilience                                       | 🔵                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - General DX                                             | 🔵 Clean and understandable TypeScript code                    | 🟡                                        | 🟡                     | 🟡                 | 🔴 JS-only           | 🔴 JS-only              | 🟡              | 🟡                | 🟡                |
| - DX: Classes                                            | 🟢 Minimal number of classes as possible                       | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Documentation                                          | 🔵                                                             | 🟡                                        | 🟡                     | 🟡                 | 🔵                   | 🟢                      | 🟡              | 🟡                | 🟢                |
| - Extendable APIs                                        | 🟢 Works well with @reliverse/relinka                          | 🟢 Huge number of community prompts       | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Designed With UX/DX in Mind                            | 🟢                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - All components support Ctrl+C                          | 🔵                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - As minimal number of dependencies as possible          | 🔵                                                             | 🟢                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| -------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------ | ---------------------- | ------------------ | -------------------- | ------------------------- | --------------- | ------------------ | ----------------- |
| **Components**                                           |                                                                |                                            |                        |                    |                      |                           |                 |                    |                   |
| -------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------ | ---------------------- | ------------------ | -------------------- | ------------------------- | --------------- | ------------------ | ----------------- |
| - Visual Components                                      | 🟢 Animated Text (incl. 6 anims) & ASCII Art (incl. 290 fonts) | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Mono Component                                         | 🟢 Mono (All-In-One) & Separate                                | 🟡                                        | 🟡                     | 🟡                 | 🔵 Mono-only         | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Start Component                                        | 🟢                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Text Component                                         | 🟢                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Password Component                                     | 🔵                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Number Component                                       | 🔵                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Confirm Component                                      | 🔵                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Select Component                                       | 🔵 Native separator support                                    | 🔵 Separator supported via `new` keyword  | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Multiselect Component                                  | 🔵 Native separator support                                    | 🔵 Separator supported via `new` keyword  | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Search/Autocomplete Component                          | 🔵                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟡              | 🟡                | 🟡                |
| - Spinner & Progressbar Components                       | 🔵                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟢                      | 🟡              | 🟡                | 🟡                |
| - Image Component                                        | 🔴 Planned                                                     | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟢                      | 🟡              | 🟡                | 🟡                |
| - Range Component                                        | 🔵                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟢                      | 🟡              | 🟡                | 🟡                |
| -------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------ | ---------------------- | ------------------ | -------------------- | ------------------------- | --------------- | ------------------ | ----------------- |
| **Arguments Support**                                    |                                                                |                                            |                        |                    |                      |                           |                 |                    |                   |
| -------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------ | ---------------------- | ------------------ | -------------------- | ------------------------- | --------------- | ------------------ | ----------------- |
| - Fast and lightweight argument parser                   | 🟢                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟢              | 🟡                | 🟡                |
| - Smart value parsing with typecast                      | 🟢                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟢              | 🟡                | 🟡                |
| - Boolean shortcuts and unknown flag handling            | 🟢                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟢              | 🟡                | 🟡                |
| - Nested sub-commands                                    | 🟢                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟢              | 🟡                | 🟡                |
| - Lazy and Async commands                                | 🟢                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟢              | 🟡                | 🟡                |
| - Pluggable and composable API                           | 🟢                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟢              | 🟡                | 🟡                |
| - Auto generated usage and help                          | 🟢                                                             | 🟡                                        | 🟡                     | 🟡                 | 🟡                   | 🟡                      | 🟢              | 🟡                | 🟡                |

**Related Links**: [@reliverse/relinka](https://github.com/reliverse/relinka#readme), [ESM/CJS](https://dev.to/iggredible/what-the-heck-are-cjs-amd-umd-and-esm-ikm), ["Pure ESM package"](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c), [Clean code](https://github.com/ryanmcdermott/clean-code-javascript#readme), ["UX patterns for CLI tools"](https://lucasfcosta.com/2022/06/01/ux-patterns-cli-tools.html), [DX (Developer Experience)](https://github.blog/enterprise-software/collaboration/developer-experience-what-is-it-and-why-should-you-care), [TypeBox](https://github.com/sinclairzx81/typebox#readme), ["ANSI Escape Sequences"](https://gist.github.com/ConnerWill/d4b6c776b509add763e17f9f113fd25b), [@chjj/blessed](https://github.com/chjj/blessed#readme), [Wrapping](https://github.com/SBoudrias/Inquirer.js/pull/255), [Visual Control](https://stackoverflow.com/questions/68344362/how-do-i-get-full-visual-control-of-a-terminal-with-node)

## Wrap-Up

@reliverse/prompts is a versatile library designed to accelerate CLI development by providing customizable prompt components. Integrated into the [Reliverse CLI](https://github.com/blefnk/reliverse#readme), @reliverse/prompts enables you to create a unique design aligned with your CLI app’s aesthetics, similar to how @shadcn/ui supports customizable web UI components. Quickly get started by copying configurations from the [Reliverse Docs](https://docs.reliverse.org/prompts) and using components that fit your project, making it faster to bring your CLI app to life. You’re free to customize each component as desired, with default designs provided to ensure an attractive interface from the start.

## Learn More

- [Temporary @reliverse/prompts Docs](.github/DOCS.md)
- [Reliverse Docs](https://docs.reliverse.org)

## Special Thanks

This project wouldn’t exist without the amazing work of the huge number of contributors to the list of projects below. Many of the @reliverse/prompts prompts are based on the incredible work of:

[@inquirer/prompts](https://github.com/SBoudrias/Inquirer.js#readme) | [terkelg/prompts](https://github.com/terkelg/prompts#readme) | [@clack/prompts](https://github.com/bombshell-dev/clack#readme) | [create-t3-app](https://github.com/t3-oss/create-t3-app#readme) | [create-astro](https://github.com/withastro/astro/tree/main/packages/create-astro#readme) | [cronvel/terminal-kit](https://github.com/cronvel/terminal-kit#readme) | [unjs/consola](https://github.com/unjs/consola#readme) | [nodejs/string_decoder](https://github.com/nodejs/string_decoder) | [TooTallNate/keypress](https://github.com/TooTallNate/keypress) | [derhuerst](https://github.com/derhuerst)

## License

[MIT](./LICENSE.md) © [Nazarii Korniienko](https://github.com/blefnk)
