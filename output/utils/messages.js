import {greenBright} from 'picocolors';
import {colorMap, typographyMap} from '../utils/mapping';
import {isUnicodeSupported} from '../utils/platforms';
import {variantMap} from '../utils/variants';

const unicode = isUnicodeSupported();
const u = (c, fallback) => unicode ? c : fallback;

const s = {
    start: u('\u256D', 'T'),
    middle: u('\u2502', '|'),
    end: u('\u2570', '\u2014'),
    line: u('\u2500', '\u2014'),
    corner_top_right: u('\xBB', 'T'),
    step_active: u('\u25C6', '\u2666'),
    step_error: u('\u25B2', 'x'),
    info: u('\u2139', 'i'),
};

function applyStyles(styledText, colorName = '', typographyName = '', variantName = '', borderColor = '') {
    if (!variantName) {
        if (colorName && colorMap[colorName]) {
            styledText = colorMap[colorName](styledText);
        }
        
        if (typographyName && typographyMap[typographyName]) {
            styledText = typographyMap[typographyName](styledText);
        }
    }
    
    if (variantName && variantMap[variantName]) {
        styledText = variantMap[variantName](styledText, borderColor);
    }
    
    return styledText;
}

export function fmt(opt) {
    if (opt.title.includes('\u2502  ')) {
        opt.title = opt.title.replace('\u2502  ', '');
    }
    
    const bar = opt.borderColor ? colorMap[opt.borderColor](s.middle) : s.middle;
    const prefixStartLine = opt.borderColor ? colorMap[opt.borderColor](s.start + s.line) : s.start + s.line;
    const prefixEndLine = opt.borderColor ? colorMap[opt.borderColor](s.end + s.line) : s.end + s.line;
    const suffixStartLine = opt.borderColor ? colorMap[opt.borderColor](`${s.line.repeat(22)}\u22B1`) : `${s.line.repeat(22)}\u22B1`;
    const suffixEndLine = opt.borderColor ? colorMap[opt.borderColor](`${s.line.repeat(52)}\u22B1`) : `${s.line.repeat(52)}\u22B1`;
    
    const MSG_CONFIGS = {
        M_START: {
            symbol: '',
            prefix: prefixStartLine,
            suffix: ` ${suffixStartLine}
${bar}`,
            newLineBefore: false,
            newLineAfter: false,
        },
        M_GENERAL: {
            symbol: '',
            prefix: greenBright(s.step_active),
            suffix: '',
            newLineBefore: false,
            newLineAfter: true,
        },
        M_INFO: {
            symbol: '',
            prefix: greenBright(s.info),
            suffix: '',
            newLineBefore: false,
            newLineAfter: true,
        },
        M_ERROR: {
            symbol: '',
            prefix: `${bar}
${s.step_error}`,
            newLineBefore: false,
            newLineAfter: true,
        },
        M_END: {
            symbol: '',
            prefix: '',
            suffix: opt.border ? ` ${suffixEndLine}
${bar}` : '',
            newLineBefore: false,
            newLineAfter: true,
        },
        M_END_ANIMATED: {
            symbol: '',
            prefix: greenBright(s.step_active),
            suffix: opt.border ? `
${bar}
${prefixEndLine}${suffixEndLine}
` : '',
            newLineBefore: false,
            newLineAfter: false,
        },
        M_NEWLINE: {
            symbol: '',
            prefix: bar,
            newLineBefore: false,
            newLineAfter: false,
        },
    };
    
    const config = MSG_CONFIGS[opt.type];
    
    if (!config) {
        throw Error(`Invalid message type: ${opt.type}`);
    }
    
    const {
        symbol = '',
        prefix = '',
        suffix = '',
        newLineBefore = false,
        newLineAfter = false,
    } = config;
    
    const formattedPrefix = prefix ? `${prefix}${opt.type === 'M_START' ? ' ' : '  '}` : '';
    const border = applyStyles(s.middle, opt.borderColor);
    let formattedTitle = '';
    
    if (opt.title) {
        formattedTitle = applyStyles(opt.title, opt.titleColor, opt.titleTypography, opt.titleVariant, opt.borderColor);
        if (opt.hint) {
            formattedTitle += `
${border}  ${colorMap.cristalGradient(opt.hint)}`;
        }
    }
    
    let formattedContent = '';
    
    if (opt.content) {
        const contentLines = opt.content.split('\n');
        
        formattedContent = contentLines
            .map((line) => {
            const styledLine = applyStyles(line, opt.contentColor, opt.contentTypography, opt.contentVariant, opt.borderColor);
            
            if (opt.type !== 'M_START') {
                return `${border}  ${styledLine}`;
            }
            
            return styledLine;
        })
            .join('\n');
    }
    
    const text = [formattedTitle, formattedContent]
        .filter(Boolean)
        .join(`
`);
    
    return [
        symbol,
        newLineBefore ? '\n' : '',
        formattedPrefix,
        text,
        newLineAfter ? `
${bar}  ` : '',
        suffix,
    ]
        .filter(Boolean)
        .join('');
}

export function msg() {}
