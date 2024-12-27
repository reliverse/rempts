# @reliverse/prompts

> **The CLI prompt library you didn’t realize you’ve been desperate for.**

It’s blazing-fast, type-safe, and has built-in crash resilience—so your command-line app can look slick without bursting into flames. Forget boilerplate-heavy setups—this library makes CLI development smooth and effortless.

## Rapid-Fire Overview

<div align="left">
  <a href="https://npmjs.org/package/@reliverse/prompts"><img src="https://img.shields.io/npm/v/@reliverse/prompts.svg" alt="version" /></a>
  <a href="https://npmjs.org/package/@reliverse/prompts"><img src="https://img.shields.io/npm/dm/@reliverse/prompts.svg" alt="downloads" /></a>
</div>

- **Docs**: [docs.reliverse.org/reliverse/prompts](https://docs.reliverse.org/reliverse/prompts/)  
- **NPM**: [npmjs.com/package/@reliverse/prompts](https://www.npmjs.com/package/@reliverse/prompts)  
- **GitHub**: [github.com/reliverse/prompts](https://github.com/reliverse/prompts)  
- **Discord**: [discord.gg/3GawfWfAPe](https://discord.gg/3GawfWfAPe)

## Install in 3.2 Seconds

```bash
bun add @reliverse/prompts
# Or npm/pnpm/yarn if that’s your style
# (deno with jsr support soon™)
```

> **Pro Tip**: Make sure you have [Bun](https://bun.sh), [Node.js](https://nodejs.org), and [Git](https://git-scm.com/downloads) installed.

## The 3-Second Pitch

> This thing is **blazing fast**, **type-safe**, and basically a bulletproof vest for your CLI.  
> No more spaghetti prompt code. Just shiny, stable, next-gen developer bliss.

### *“But why not stick with Inquirer or Clack?”*

1. Better typed validation, bigger ASCII art, more interactive goodies, and next-level color theming.  
2. Because you deserve better than “just good enough.”

## Key Selling Points

- **TypeScript-first**: So your TypeScript dev heart can flutter in peace. Enjoy IntelliSense and zero guesswork.
- **Flexible Prompt Types**: Text, confirm, select, multiselect, password, number, spinner, toggle, and many more… you do you.  
- **Schema-driven Validations**: Easily integrates with TypeBox, Zod, or your own thing. No more “hope it works” solutions.  
- **Accessibility**: Terminal-size awareness, WCAG AA color contrast, the whole enchilada.
- **Crash-safe**: Ctrl+C or random cosmic rays? It shrugs them off.  

## Why @reliverse/prompts?

Consider it your brand-new sports car, while your old CLI prompt library was a rusty lawnmower. Also, it’s a feature-packed replacement for Inquirer, Enquirer, Clack, Terkelg, Terminal-Kit, and a bunch more.  

[**Go deeper in the docs →**](https://docs.reliverse.org/reliverse/prompts/)

### Straight-Up GOAT Features

- **Full Cross-Platform ESM**: Seamlessly works with the Node.js and Bun environments.  
- **Extensible UI**: Because color, typography, animations, and more matter to your terminal fashion sense.
- **Built for DX**: Minimal dependencies, clean API, full validation baked in, and more.
- **Mono Component**: Perfect for rapid prototyping. Or if you’re feeling lazy.  

## Speedrun Example

```ts
import { inputPrompt } from "@reliverse/prompts";

await startPrompt({
  clearConsole: true,
  titleColor: "inverse",
  packageName: "@reliverse/cli",
  packageVersion: "1.0.0",
  terminalSizeOptions: {
    minWidth: 100,
    minHeight: 16,
    // 🗴  Oops! Terminal width is too small. Expected >100 | Current: 97
  },
});

const username = await inputPrompt({
  id: "username",
  title: "Welcome to @reliverse/prompts Demo!",
  content: "What's your name?",
});

console.log(`Hey there, ${username}!`);
```

## Task Management

The library provides a powerful task management system with built-in verification steps, spinners, and error handling:

- **Spinner and progress bars that actually move**: Progress tracking with current/total counts and status messages  
- **Task priorities (because some stuff is more important)**: Critical, high, normal, low  
- **Built-in stats, error handling, and cancellation**: Task timing and statistics, built-in error handling and cancellation support  
- **Customizable spinners to keep your eyes happy**: Customizable spinners and progress indicators  
- **Nested subtasks and task groups**: Group tasks and subtasks for better organization  
- **Automatic verification steps with customizable delays**
- **Simple error handling with proper formatting**
- **Progress tracking for long-running operations**
- **Custom validation and business logic support**

Visit [docs](https://docs.reliverse.org/reliverse/prompts/#task-management) to learn more and see examples.

## Playground Mode

```bash
git clone https://github.com/reliverse/prompts.git
cd prompts
bun i
bun dev
```

Check out `examples/launcher.ts` for a smorgasbord of demos (including a quiz). Who says CLIs can’t be fun?

## Examples to Copy-Paste

1. **1-main.ts**: A powerhouse CLI example with all the trimmings, with advanced styling and all prompts.
2. **2-mono.ts**: A single `prompt()` for multiple components—perfect for CLI where performance doesn't matter.  
3. **3-simple.ts**: Less code, more speed.  
4. **4-args-a.ts** + **5-args-b.ts**: Turn sub-commands into a more headless experience.

## Custom Config FTW

You don’t want a one-size-fits-all library. We got you:

```ts
const basicConfig = {
  titleColor: "cyanBright",
  titleTypography: "bold",
  borderColor: "dim",
} satisfies PromptOptions;

const extendedConfig = {
  ...basicConfig,
  contentTypography: "italic",
  contentColor: "dim",
} satisfies PromptOptions;

const username = await inputPrompt({
  id: "username",
  title: "Testing out our fancy library!",
  content: "What's your username?",
  ...extendedConfig,
});
```

## Mono Component: One Import to Rule Them All

If you’re lazy (like the rest of us), in a hurry, or just want everything jammed together, the Mono Component wraps up all prompt types in a single import.

```ts
export const IDs = {
  start: "start",
  username: "username",
  // ...
};
```

## Comparison Table

We’re not shy. We lined up **@reliverse/prompts** against Inquirer, Clack, Terminal-Kit, etc. Our goal? **Turn every feature dot green**. [**Check out the epic chart**](https://docs.reliverse.org/reliverse/prompts/#prompts-library-comparison)

## Arguments Support

You can’t build an amazing CLI without argument parsing. We’ve got a built-in fast parser that typecasts your things automatically.

## Wrap It Up

@reliverse/prompts is more than just pretty and fast prompts—it’s a full-blown CLI builder with customizable designs and robust typing. It’s built to slot seamlessly into Reliverse’s ecosystem, but even if you’re rolling your own thing, you’ll appreciate the minimal boilerplate and fancy visuals.

- **CLI builder** with style & resilience  
- **Customizable** design and color theming  
- **Zero guesswork** with TypeScript integrations  
- **Minimal boilerplate** with maximum results

## More Goodies

- [**Reliverse Docs**](https://docs.reliverse.org/reliverse/prompts/)

## Special Thanks

**@inquirer/prompts**, **@terkelg/prompts**, **@clack/prompts**, **@unjs/citty**, and many more other open-source legends. You built the shoulders we stand on.

## License

**MIT** © [Nazarii Korniienko](https://github.com/reliverse/prompts)

## Screenshot Brag

[![CLI Example](./examples/main.png)](./examples/main.png)

> **Stop reading. Start coding.**  
>
> If you’re serious about CLIs—don’t just build—**Reliverse it** with `@reliverse/prompts`.
