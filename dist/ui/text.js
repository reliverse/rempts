import { Value } from "@sinclair/typebox/value";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { colorize } from "../utils/colorize";
import { symbol, msg, fmt } from "../utils/messages";
import { applyVariant } from "../utils/variants";
export async function textPrompt(options, currentState = {
  id: "",
  state: "initial",
  symbol: symbol("S_MIDDLE", "initial"),
  value: void 0
}) {
  const {
    title,
    titleColor,
    titleTypography,
    titleVariant,
    content,
    contentColor,
    contentTypography,
    contentVariant,
    hint,
    schema,
    validate,
    state = "initial",
    default: defaultValue = ""
  } = options;
  const rl = readline.createInterface({ input, output });
  const updateState = (newState) => {
    currentState.state = newState;
    currentState.symbol = symbol("S_MIDDLE", newState);
  };
  updateState(state);
  const styledTitle = applyVariant(
    [colorize(title, titleColor, titleTypography)],
    titleVariant
  );
  const text = [styledTitle, content].filter(Boolean).join("\n");
  const question = fmt("MT_MIDDLE", "initial", text, 1);
  const validateAnswer = async (answer) => {
    if (schema && !Value.Check(schema, answer)) {
      return [...Value.Errors(schema, answer)][0]?.message || "Invalid input.";
    }
    if (validate) {
      const validation = await validate(answer);
      return validation === true ? true : validation || "Invalid input.";
    }
    return true;
  };
  while (true) {
    const answer = await rl.question(question) || defaultValue;
    const validation = await validateAnswer(answer);
    if (validation === true) {
      updateState("completed");
      currentState.value = answer;
      rl.close();
      return answer;
    } else {
      updateState("error");
      msg("MT_MIDDLE", "error", validation, 0);
    }
  }
}
