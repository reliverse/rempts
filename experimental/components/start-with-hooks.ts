import type { PromptOptions } from "~/types";

import { colorize } from "~/utils/colorize";
import { applyVariant } from "~/utils/variant";

import { useEffect } from "../hooks";
import { useBar } from "../hooks/useBar";
import { usePromptState } from "../hooks/usePromptState";

export async function startPrompt(options: PromptOptions): Promise<void> {
  const { state: initialState = "initial" } = options;
  const { state, setState, figure } = usePromptState(initialState);
  const bars = useBar(state);

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

  useEffect(() => {
    // Simulate a state update after 2 seconds
    const timer = setTimeout(() => {
      if (message && message.length > 20) {
        setState("active"); // Switch to 'active' state if message length is > 20
      } else {
        setState("initial"); // Default to 'initial' state
      }
    }, 2000);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, [message, setState]);

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

  console.log(`${bars.start}${figure} ${styledTitle}`);
  if (styledMessage) {
    console.log(`${bars.middle} ${styledMessage}`);
  }
  console.log(bars.middle);
}
