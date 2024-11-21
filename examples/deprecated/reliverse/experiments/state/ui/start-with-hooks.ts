import type { PromptOptionsDeprecated } from "~/unsorted/types/internal";

import { useEffect } from "~/core/use-effect";
import { usePromptState } from "~/unsorted/hooks/usePromptState";
import { colorize } from "~/unsorted/utils/colorize";
import { applyVariant } from "~/unsorted/utils/variants";

export async function startPrompt(
  options: PromptOptionsDeprecated,
): Promise<void> {
  const { state: initialState = "initial" } = options;
  const { state, setState, figure } = usePromptState(initialState);

  const {
    title,
    titleColor,
    titleTypography,
    titleVariant,
    content,
    contentColor,
    contentTypography,
    contentVariant,
    variantOptions,
  } = options;

  useEffect(() => {
    // Simulate a state update after 2 seconds
    const timer = setTimeout(() => {
      if (content && content.length > 20) {
        setState("active"); // Switch to 'active' state if message length is > 20
      } else {
        setState("initial"); // Default to 'initial' state
      }
    }, 2000);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, [content, setState]);

  const coloredTitle = colorize(title, titleColor, titleTypography);
  const coloredContent = content
    ? colorize(content, contentColor, contentTypography)
    : "";

  const styledTitle = applyVariant(
    [coloredTitle],
    titleVariant,
    variantOptions?.box,
  );
  const styledContent = coloredContent
    ? applyVariant([coloredContent], contentVariant, variantOptions?.box)
    : "";

  console.log(`${figure} ${styledTitle}`);
  if (styledContent) {
    console.log(`${styledContent}`);
  }
}
