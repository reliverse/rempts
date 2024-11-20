import { symbol } from "@/reliverse/experiments/utils/symbols.js";
import { useEffect } from "./use-effect.js";
import { useState } from "./use-state.js";
export function useBar(state) {
    const [bars, setBars] = useState(symbol("S_BAR_H", state));
    useEffect(() => {
        setBars(symbol("S_BAR_H", state));
    }, [state]);
    return bars;
}
