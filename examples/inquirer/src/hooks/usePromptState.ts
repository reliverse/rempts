import type { State } from "~/types";

import { symbol } from "~/utils/states";

import { useEffect } from "./use-effect";
import { useState } from "./use-state";

export function usePromptState(initialState: State) {
  const [state, setState] = useState<State>(initialState);
  const [figure, setFigure] = useState<string>(symbol(initialState));

  useEffect(() => {
    setFigure(symbol(state));
  }, [state]);

  return { state, setState, figure };
}
