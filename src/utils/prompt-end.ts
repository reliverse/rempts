import type { ColorName, TypographyName } from "~/types/general.js";
import type { VariantName } from "~/utils/variants.js";

import { msg } from "~/utils/messages.js";

/**
 * Ends the prompt by optionally displaying an end message and running the action if confirmed.
 * Preserves the last prompt state unless there's an endTitle.
 */
export async function completePrompt(
  isCtrlC: boolean,
  endTitle: string,
  endTitleColor: ColorName,
  titleTypography: TypographyName,
  titleVariant: VariantName | undefined,
  border: boolean,
  borderColor: ColorName,
  action?: () => Promise<void>,
  value?: boolean,
): Promise<boolean> {
  if (action && value) {
    await action();
  }

  if (isCtrlC) {
    msg({
      type: "M_END",
      title: endTitle,
      titleColor: endTitleColor,
      titleTypography,
      ...(titleVariant ? { titleVariant } : {}),
      border,
      borderColor,
    });
  } else {
    msg({
      type: "M_BAR",
      borderColor,
    });
  }

  return value ?? false;
}
