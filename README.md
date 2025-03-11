# @reliverse/prompts

> **A modern CLI prompt library. Fast, type-safe, and built to last.**

[![NPM Version](https://img.shields.io/npm/v/@reliverse/prompts.svg?style=flat-square)](https://npmjs.com/package/@reliverse/prompts)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](#license)

**Quick Links:**

- **[Docs](https://docs.reliverse.org/reliverse/prompts)**
- **[NPM](https://npmjs.com/package/@reliverse/prompts)**
- **[JSR](https://jsr.io/@reliverse/prompts)**
- **[GitHub](https://github.com/reliverse/prompts)**
- **[Discord](https://discord.gg/3GawfWfAPe)**

## Overview

`@reliverse/prompts` is a **type-safe**, high-performance library for building modern CLI applications. It's designed to help you focus on creating **great user experiences**, not juggling repetitive CLI logic.

Use `@reliverse/prompts` for everything from quick scripts to full-featured, production-grade tools. With minimal boilerplate, robust error handling, and built-in accessibility features, you'll be shipping delightful CLI workflows in no time.

## Key Features

- **TypeScript-first**  
  Get robust type definitions and IntelliSense for a smoother development experience.
- **Flexible Prompt Types**  
Includes logger, input (text, password), confirm, select, multiselect, toggle, number, spinner, and more.
- **Schema-Driven Validation**  
  Native compatibility with TypeBox, Zod, or any custom validation strategy.
- **Accessible & Adaptive**  
  Supports terminal resizing, color contrast preferences, and meets WCAG AA standards.
- **Crash-Resistant**  
  Gracefully handles Ctrl+C, unexpected exits, and other edge cases without breaking.

## Installation

```bash
bun add @reliverse/prompts
# Or use npm, pnpm, yarn
```

> **Tip:** Make sure [Bun](https://bun.sh), [Node.js](https://nodejs.org), and [Git](https://git-scm.com/downloads) are installed before proceeding.

## Why Reliverse Prompts?

Unlike Inquirer, Clack, or other prompt libraries, `@reliverse/prompts` centers on **developer experience**:

- **Enhanced Runtime Typing** – for fewer runtime errors and better IDE hints.
- **Built-in Error Handling** – robust crash prevention right out of the box.
- **Customizable Design & Theming** – tailor the look and feel to match your brand.
- **Zero Guesswork with TypeScript** – strict typing means fewer surprises.
- **Built-in Argument Parsing** – do more with less code by leveraging built-in typecasting and validation.

Benchmarks confirm that `@reliverse/prompts` is one of the fastest and easiest libraries to work with.  
[See the feature comparison →](https://docs.reliverse.org/reliverse/prompts/#prompts-library-comparison)

## Playground Mode

Try out examples locally to see how everything works in practice:

```bash
git clone https://github.com/reliverse/prompts.git
cd prompts
bun i
bun dev
```

Then open **`examples/launcher.ts`** to explore various interactive demos or experiment with different prompt types.

![example](./examples/main.png)

## Example Usage

Here's a quick look at how you might use `@reliverse/prompts` in your CLI:

```ts
import {
  startPrompt, // Initializes the CLI session (clears the console, sets a custom title, etc.)
  inputPrompt  // Fetches user input with validation and styled UI
} from "@reliverse/prompts";

await startPrompt({
  clearConsole: true,
  titleColor: "inverse",
  packageName: "@reliverse/cli",
  packageVersion: "1.0.0",
});

const username = await inputPrompt({
  id: "username",
  title: "Welcome!",
  content: "What's your name?",
});

console.log(`Hey there, ${username}!`);
```

## Contributing

Contributions are always welcome! Open a pull request or start a discussion on [GitHub](https://github.com/reliverse/prompts) if you'd like to help. By the way, this project emphasizes functional programming approaches, avoiding traditional OOP classes.

## License

**MIT License** © [Nazarii Korniienko](https://github.com/reliverse/prompts)

Feel free to modify and redistribute under the terms of the MIT license. See the [LICENSE](LICENSE) file for more details.

Thanks for checking out `@reliverse/prompts`. If you have any questions, join our [Discord community](https://discord.gg/3GawfWfAPe) or file an issue on GitHub. We look forward to seeing what you build!
