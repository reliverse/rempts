import {colorize} from '../utils/colorize';
import {msg} from '../utils/messages';
import {applyVariant} from '../utils/variants';

export function startPrompt({title, titleColor, titleTypography, titleVariant, variantOptions, dashCount = 23}) {
    const coloredTitle = colorize(title, titleColor, titleTypography);
    const styledTitle = applyVariant([coloredTitle], titleVariant, variantOptions?.box);
    
    msg('M_START', 'initial', styledTitle, dashCount);
}
