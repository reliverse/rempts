# @reliverse/prompts

- A single library to build the entire command line interface application.
- A modern, crash-resistant library for creating seamless, typesafe prompts in CLI applications.
- Designed for simplicity and elegance, it enables intuitive and robust user interactions.

[![example prompt](./public/example.gif)](https://docs.reliverse.org/prompts)

## Installation

Install via your preferred package manager:

```sh
bun add @reliverse/prompts # instead of bun you can use: npm, pnpm, or yarn (deno support is coming soon)
```

[![confirm prompt](./public/confirm.gif)](https://docs.reliverse.org/prompts)

## Key Features

- **Type Safety**: Built with TypeScript, ensuring robust types and preventing runtime errors.
- **Schema Validation**: Define and validate inputs using schemas for reliable data handling.
- **Flexibility**: Supports various prompt types including text, password, number, select, and multiselect.
- **Crash Resilience**: Structured to handle cancellations and errors gracefully, keeping your application stable.

## Prompt Types

- **Text**: Simple text input.
- **Password**: Secure, hidden input for passwords.
- **Number**: Numeric input with validation.
- **Confirm**: Yes/No prompt.
- **Select**: Dropdown selection from multiple choices.
- **Multiselect**: Multiple choice selection from a list.
  
## Validation

Each prompt can include custom validation logic to provide immediate feedback to the user.

## Playground

Install the @reliverse/prompts library locally and run the following examples to see the library in action. Alternatively, you can just visit the following links to see the code:

1. `bun dev:id` - [examples/reliverse/install-deps.ts](https://github.com/reliverse/prompts/blob/main/examples/reliverse/install-deps.ts) - An advanced example of a CLI that installs dependencies. Trying to create a drop-in replacement for [@clack/prompts](https://github.com/bombshell-dev/clack/tree/main/packages/prompts#readme), [unjs/consola](https://github.com/unjs/consola#readme), [@inquirer/prompts](https://github.com/SBoudrias/Inquirer.js#readme), [terkelg/prompts](https://github.com/terkelg/prompts#readme), [withastro/astro](https://github.com/withastro/astro/tree/main/packages/create-astro), etc.
2. `bun dev:us` - [examples/reliverse/user-signup.ts](https://github.com/reliverse/prompts/blob/main/examples/reliverse/user-signup.ts) - An advanced example of a CLI application that simulates a user signup process.
3. `bun dev:wm` - [examples/reliverse/win-mln-js.ts](https://github.com/reliverse/prompts/blob/main/examples/reliverse/win-mln-js.ts) - A fun example of a quiz game. Inspired by [this video](https://youtube.com/watch?v=_oHByo8tiEY) created by Fireship.
4. `bun dev:sc` - [examples/reliverse/simple-check.ts](https://github.com/reliverse/prompts/blob/main/examples/reliverse/simple-check.ts) - Just a very basic example to check the library.

## Installing Locally

```sh
clone https://github.com/reliverse/prompts.git
cd prompts
bun i
```
