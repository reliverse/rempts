import type { StateDeprecated } from "~/types/internal.js";

import { useEffect } from "~/core/use-effect.js";
import { useState } from "~/core/use-state.js";

export function usePromptState(initialState: StateDeprecated) {
  const [state, setState] = useState<StateDeprecated>(initialState);
  const [figure, setFigure] = useState<string>("🟢");

  useEffect(() => {
    setFigure("🟢");
  }, [state]);

  return { state, setState, figure };
}
