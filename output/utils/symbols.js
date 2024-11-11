import {colorize} from './colorize.js';
import {isUnicodeSupported} from './platforms.js';

const unicode = isUnicodeSupported();
const s = (c, fallback) => unicode ? c : fallback;

export const styledSymbols = (symbol2, state) => {
    switch(state) {
    case 'initial':
        return colorize(symbol2, 'viceGradient');
    
    case 'active':
        return colorize(symbol2, 'passionGradient');
    
    case 'cancel':
        return colorize(symbol2, 'mindGradient');
    
    case 'error':
        return colorize(symbol2, 'red');
    
    case 'submit':
        return colorize(symbol2, 'cristalGradient');
    
    default:
        return colorize(symbol2, void 0);
    }
};
const SYMBOLS = {
    S_START: s('\u256D', 'T'),
    S_MIDDLE: s('\u2502', '|'),
    S_END: s('\u2570', '\u2014'),
    S_LINE: s('\u2500', '\u2014'),
    S_STEP_ACTIVE: s('\u25C6', '\u2666'),
    S_STEP_CANCEL: s('\u25A0', 'x'),
    S_STEP_ERROR: s('\u25B2', 'x'),
    S_STEP_SUBMIT: s('\u25C7', 'o'),
    S_RADIO_ACTIVE: s('\u25C9', '(*)'),
    S_RADIO_INACTIVE: s('\u25EF', '( )'),
    S_CHECKBOX_ACTIVE: s('\u25A1', '[\u2022]'),
    S_CHECKBOX_SELECTED: s('\u25A0', '[+]'),
    S_CHECKBOX_INACTIVE: s('\u25A1', '[ ]'),
    S_PASSWORD_MASK: s('\u25AA', '\u2022'),
    S_BAR_H: s('\u2500', '-'),
    S_CORNER_TOP_RIGHT: s('\u256E', '+'),
    S_CONNECT_LEFT: s('\u2570', '+'),
    S_CORNER_BOTTOM_RIGHT: s('\u256F', '+'),
};

export const symbol = (type, state) => {
    const baseSymbol = SYMBOLS[type];
    return styledSymbols(baseSymbol, state);
};
