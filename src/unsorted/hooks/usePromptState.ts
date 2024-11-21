import type { StateDeprecated } from "~/unsorted/types/internal";

import { useEffect } from "~/core/use-effect";
import { useState } from "~/core/use-state";

export function usePromptState(initialState: StateDeprecated) {
  const [state, setState] = useState<StateDeprecated>(initialState);
  const [figure, setFigure] = useState<string>("🟢");

  useEffect(() => {
    setFigure("🟢");
  }, [state]);

  return { state, setState, figure };
}
