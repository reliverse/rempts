import { symbol } from "@/reliverse/experiments/utils/symbols.js";

import type { StateDeprecated } from "~/types/dev.js";

import { useEffect } from "./use-effect.js";
import { useState } from "./use-state.js";

export function usePromptState(initialState: StateDeprecated) {
  const [state, setState] = useState<StateDeprecated>(initialState);
  const [figure, setFigure] = useState<string>(
    symbol("S_MIDDLE", initialState),
  );

  useEffect(() => {
    setFigure(symbol("S_MIDDLE", state));
  }, [state]);

  return { state, setState, figure };
}
