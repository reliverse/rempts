import { symbol } from "@/reliverse/experiments/utils/symbols";

import type { StateDeprecated } from "~/types/dev";

import { useEffect } from "./use-effect";
import { useState } from "./use-state";

export function useBar(state: StateDeprecated) {
  const [bars, setBars] = useState<string>(symbol("S_BAR_H", state));

  useEffect(() => {
    setBars(symbol("S_BAR_H", state));
  }, [state]);

  return bars;
}
