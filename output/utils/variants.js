import {colorMap} from './mapping.js';

const {isArray} = Array;
const maybeArray = (a) => isArray(a) ? a : [a];

export const variantMap = {
    box: createBox,
    doubleBox: createDoubleBox,
    banner: createBanner,
    underline: createUnderline,
};
export function applyVariant(lines, variant, options, borderColor) {
    const linesArray = maybeArray(lines);
    
    switch(variant) {
    case 'box':
        return createBox(linesArray, options?.limit);
    
    case 'doubleBox':
        return createDoubleBox(linesArray, options?.limit, borderColor);
    
    case 'banner':
        return createBanner(linesArray);
    
    case 'underline':
        return createUnderline(linesArray);
    
    default:
        return linesArray.join('\n');
    }
}

function createBox(lines, limit) {
    const processedLines = processLines(lines, limit);
    const maxLength = Math.max(...processedLines.map((line) => line.length));
    const topBorder = `\u250C${'\u2500'.repeat(maxLength + 2)}\u2510`;
    const bottomBorder = `\u2514${'\u2500'.repeat(maxLength + 2)}\u2518`;
    const middle = processedLines
        .map((line) => `\u2502 ${line.padEnd(maxLength)} \u2502`)
        .join('\n');
    
    return `${topBorder}
${middle}
${bottomBorder}`;
}

function createDoubleBox(lines, limit, borderColor) {
    const processedLines = processLines(lines, limit);
    const maxLength = Math.max(...processedLines.map((line) => line.length));
    const indentation = '';
    
    if (borderColor === void 0) {
        borderColor = 'viceGradient';
    }
    
    const topBorder = borderColor ? colorMap[borderColor](`${'\u2550'.repeat(maxLength)}\u2557`) : `${'\u2550'.repeat(maxLength)}\u2557`;
    const bottomBorder = borderColor ? colorMap[borderColor](`${indentation}\u255A${'\u2550'.repeat(maxLength + 2)}\u255D`) : `${indentation}\u255A${'\u2550'.repeat(maxLength + 2)}\u255D`;
    
    const middle = processedLines
        .map((line, index) => {
        const lineIndentation = !index ? indentation : `${indentation}  `;
        return `${lineIndentation}${borderColor ? colorMap[borderColor]('\u2551') : '\u2551'} ${colorMap[borderColor](line.padEnd(maxLength))} ${borderColor ? colorMap[borderColor]('\u2551') : '\u2551'}`;
    })
        .join('\n');
    
    return `${topBorder}
${middle}
${bottomBorder}`;
}

function createBanner(lines) {
    const text = lines.join(' ');
    const bannerLine = '*'.repeat(text.length + 4);
    
    return `${bannerLine}
* ${text} *
${bannerLine}`;
}

function createUnderline(lines) {
    return lines
        .map((line) => `${line}
${'='.repeat(line.length)}`)
        .join('\n');
}

function processLines(lines, limit) {
    const linesArray = maybeArray(lines);
    
    return linesArray.map((line) => {
        let truncatedLine = line;
        
        if (limit && line.length > limit) {
            truncatedLine = `${line.slice(0, limit - 3)}...`;
        }
        
        return truncatedLine.padEnd(limit || truncatedLine.length);
    });
}
