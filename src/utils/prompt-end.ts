import type { ColorName, TypographyName } from "@reliverse/relinka";
import type { VariantName } from "@reliverse/relinka";

import { msg } from "@reliverse/relinka";

/**
 * Ends the prompt by optionally displaying an end message and running the action if confirmed.
 * Preserves the last prompt state unless there's an endTitle.
 */
export async function completePrompt(
  isCtrlC: boolean,
  endTitle = "",
  endTitleColor: ColorName = "dim",
  titleTypography: TypographyName = "none",
  titleVariant: VariantName | undefined = undefined,
  border = true,
  borderColor: ColorName = "dim",
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
