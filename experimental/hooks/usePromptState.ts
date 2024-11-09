import { useState, useEffect } from "experimental/hooks";

import type { State } from "~/types";

import { symbol } from "~/utils/states";

export function usePromptState(initialState: State) {
  const [state, setState] = useState<State>(initialState);
  const [figure, setFigure] = useState<string>(symbol(initialState));

  useEffect(() => {
    setFigure(symbol(state));
  }, [state]);

  return { state, setState, figure };
}
