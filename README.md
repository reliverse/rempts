# @reliverse/prompts

[💖 GitHub Sponsors](https://github.com/sponsors/blefnk) • [💬 Discord](https://discord.gg/3GawfWfAPe) • [📦 NPM](https://npmjs.com/package/@reliverse/prompts) • [📚 Docs](https://docs.reliverse.org/reliverse/prompts) • [✨ GitHub](https://github.com/reliverse/prompts)

**@reliverse/prompts** is your modern, type-safe toolkit for building delightful CLI experiences. It's fast, flexible, and built with developer joy in mind. Forget the clutter — this is how CLI should feel.

## ⚡ Why It Rocks

- ✨ **TypeScript-first** — fully typed prompts and helpers, with great DX
- 🔧 **Flexible Prompt Types** — input, password, select, multiselect, confirm, toggle, number, spinner, and more
- 🧠 **Smart validation** — works with Zod, TypeBox, or your own validators
- 🌈 **Accessible & Adaptive** — meets WCAG AA, handles terminal resizing & color contrast
- 🧯 **Crash-resistant** — gracefully exits on Ctrl+C or unexpected input
- 🎨 **Custom theming** — make it match your CLI style
- 🚀 **Zero boilerplate** — focus on the logic, not the wiring

## 🛠️ Install

```bash
bun add @reliverse/prompts
# or npm, pnpm, yarn
```

Make sure you have [Bun](https://bun.sh), [Node.js](https://nodejs.org), and [Git](https://git-scm.com/downloads) installed.

## 🧪 Try It Out (Playground Mode)

Wanna test drive before integrating? Clone the repo and run:

```bash
git clone https://github.com/reliverse/prompts.git
cd prompts
bun i
bun dev
```

Then open `examples/launcher.ts` and explore different prompts.

![example](./examples/main.png)

## 🧩 Example Usage

```ts
import {
  startPrompt, // Initialize prompt session (optional)
  inputPrompt, // Ask for user input
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

> 🔎 You can also use `selectPrompt`, `multiselectPrompt`, `confirmPrompt`, `numberPrompt`, `spinnerPrompt`, and more.

## 🧠 Bonus Goodies

- ⚙️ **Built-in argument parsing** — parse CLI args without a separate lib
- 🧪 **Unit-test friendly** — prompts can be mocked/stubbed
- 📚 **Minimal API surface** — easy to learn, hard to outgrow
- 💅 **Custom styles** — tweak colors, formats, and transitions

## 🔍 Why not Inquirer or Clack?

While we love other tools, `@reliverse/prompts` was built for:

- Dev-first ergonomics
- Fully typed workflows
- Configurable theming
- Better crash handling & UX polish

[See feature comparison →](https://docs.reliverse.org/reliverse/prompts/#prompts-library-comparison)

## 💡 Contributing

Wanna improve prompts or add something cool? PRs welcome!  
This project favors functional programming over OOP — no classes, just clean, composable logic.

Open a PR or discussion on [GitHub](https://github.com/reliverse/prompts).

## 🙏 Shoutout

This wouldn't exist without these gems:

- [sboudrias/inquirer.js](https://github.com/sboudrias/inquirer.js)
- [unjs/citty](https://github.com/unjs/citty)
- [lukeed/mri](https://github.com/lukeed/mri)

## 📄 License

💖 MIT © 2025 [blefnk Nazar Kornienko](https://github.com/blefnk)
