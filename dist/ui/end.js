import { colorize } from "../utils/colorize";
import { symbol } from "../utils/messages";
import { applyVariant } from "../utils/variants";
export async function endPrompt(options) {
  const {
    title,
    titleColor,
    titleVariant,
    titleTypography,
    content,
    contentColor,
    contentVariant,
    contentTypography,
    state = "initial"
  } = options;
  const figure = symbol("S_MIDDLE", state);
  const coloredTitle = colorize(title, titleColor, titleTypography);
  const coloredContent = content ? colorize(content, contentColor, contentTypography) : "";
  const titleText = applyVariant([coloredTitle], titleVariant);
  const contentText = coloredContent ? applyVariant([coloredContent], contentVariant) : "";
  const styledText = [titleText, contentText].filter(Boolean).join("\n");
  console.log(`${figure} ${styledText}`);
}
