import { symbol } from "@/reliverse/experiments/utils/symbols.js";

import type { StateDeprecated } from "~/types/dev.js";

import { useEffect } from "./use-effect.js";
import { useState } from "./use-state.js";

export function useBar(state: StateDeprecated) {
  const [bars, setBars] = useState<string>(symbol("S_BAR_H", state));

  useEffect(() => {
    setBars(symbol("S_BAR_H", state));
  }, [state]);

  return bars;
}
