import { symbol } from "@/reliverse/experiments/utils/symbols";

import type { StateDeprecated } from "~/types/dev";

import { useEffect } from "./use-effect";
import { useState } from "./use-state";

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
