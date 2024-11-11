import { symbol } from "examples/reliverse/experiments/utils/symbols";

import type { State } from "~/types";

import { useEffect } from "./use-effect";
import { useState } from "./use-state";

export function usePromptState(initialState: State) {
  const [state, setState] = useState<State>(initialState);
  const [figure, setFigure] = useState<string>(
    symbol("S_MIDDLE", initialState),
  );

  useEffect(() => {
    setFigure(symbol("S_MIDDLE", state));
  }, [state]);

  return { state, setState, figure };
}
