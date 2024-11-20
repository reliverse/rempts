import { symbol } from "@/reliverse/experiments/utils/symbols.js";
import { useEffect } from "./use-effect.js";
import { useState } from "./use-state.js";
export function usePromptState(initialState) {
    const [state, setState] = useState(initialState);
    const [figure, setFigure] = useState(symbol("S_MIDDLE", initialState));
    useEffect(() => {
        setFigure(symbol("S_MIDDLE", state));
    }, [state]);
    return { state, setState, figure };
}
