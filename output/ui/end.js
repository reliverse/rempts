import {promptsAnimateText} from '../components/animate';
import {msg} from '../utils/messages';

export async function endPrompt({title, titleAnimated, titleColor, titleTypography, titleVariant, titleAnimation, titleAnimationDelay, border = true, borderColor = 'none'}) {
    if (titleAnimation) {
        if (!titleAnimated) {
            throw Error('[endPrompt] titleAnimated is required when titleAnimation is provided');
        }
        
        await promptsAnimateText({
            title,
            titleAnimated,
            anim: titleAnimation,
            delay: titleAnimationDelay,
            type: 'M_END_ANIMATED',
            titleColor,
            titleTypography,
            border,
            borderColor,
        });
    } else {
        msg({
            type: 'M_END',
            title,
            titleColor,
            titleTypography,
            titleVariant,
            border,
            borderColor,
        });
    }
}
