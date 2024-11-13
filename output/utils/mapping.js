import chalk from 'chalk';
import colors from 'picocolors';
import gradient, {
    cristal,
    mind,
    passion,
    retro,
    vice,
    rainbow,
} from 'gradient-string';

export const colorMap = {
    dim: colors.dim,
    inverse: colors.inverse,
    black: colors.black,
    red: colors.red,
    green: colors.green,
    yellow: colors.yellow,
    blue: colors.blue,
    magenta: colors.magenta,
    cyan: colors.cyan,
    cyanBright: colors.cyanBright,
    bgCyan: colors.bgCyan,
    bgCyanBright: colors.bgCyanBright,
    white: colors.white,
    gray: colors.gray,
    grey: colors.gray,
    gradientGradient: gradient([
        'red',
        'yellow',
        'green',
        'cyan',
        'blue',
        'magenta',
    ]),
    rainbowGradient: rainbow,
    cristalGradient: cristal,
    mindGradient: mind,
    passionGradient: passion,
    viceGradient: vice,
    retroGradient: retro,
    none: colors.reset,
};
export const typographyMap = {
    bold: chalk.bold,
    italic: chalk.italic,
    underline: chalk.underline,
    strikethrough: chalk.strikethrough,
};
