import {msg} from '../utils/messages';

export function startPrompt({title, titleColor, titleTypography, titleVariant, borderColor = 'none'}) {
    msg({
        type: 'M_START',
        title: ` ${title} `,
        titleColor,
        titleTypography,
        titleVariant,
        borderColor,
    });
}
