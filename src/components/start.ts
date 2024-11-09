import type { PromptOptions, State } from "~/types";

import { colorize } from "~/utils/colorize";
import { applyVariant } from "~/utils/variant";

export async function startPrompt(options: PromptOptions): Promise<void> {
  const {
    title,
    titleColor,
    titleTypography,
    titleVariant,
    message,
    msgColor,
    msgTypography,
    msgVariant,
    variantOptions,
  } = options;

  let state = options.state || "initial";
  let figure = getFigure(state);

  function setState(newState: State) {
    state = newState;
    figure = getFigure(state);
    renderPrompt();
  }

  const bars = getBars(state);

  setTimeout(() => {
    if (message && message.length > 20) {
      setState("active");
    } else {
      setState("initial");
    }
  }, 2000);

  function renderPrompt() {
    const coloredTitle = colorize(title, titleColor, titleTypography);
    const coloredMessage = message
      ? colorize(message, msgColor, msgTypography)
      : "";

    const styledTitle = applyVariant(
      [coloredTitle],
      titleVariant,
      variantOptions?.box,
    );
    const styledMessage = coloredMessage
      ? applyVariant([coloredMessage], msgVariant, variantOptions?.box)
      : "";

    console.clear();
    console.log(`${bars.start}${figure} ${styledTitle}`);
    if (styledMessage) {
      console.log(`${bars.middle} ${styledMessage}`);
    }
    console.log(bars.middle);
  }

  renderPrompt();
}

function getFigure(state: string): string {
  const figures = {
    initial: "🔹",
    active: "🔸",
  } as const;
  return figures[state as keyof typeof figures] || figures.initial;
}

function getBars(state: string) {
  const barStyles = {
    initial: { start: "|", middle: "-", end: "|" },
    active: { start: "[", middle: "=", end: "]" },
  } as const;
  return barStyles[state as keyof typeof barStyles] || barStyles.initial;
}
