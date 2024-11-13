import {ChalkAnimation} from '@figliolia/chalk-animation';
import {deleteLastLine} from '../utils/console';
import {msg} from '../utils/messages.js';

export const animationMap = {
    rainbow: ChalkAnimation.rainbow,
    pulse: ChalkAnimation.pulse,
    glitch: ChalkAnimation.glitch,
    radar: ChalkAnimation.radar,
    neon: ChalkAnimation.neon,
    karaoke: ChalkAnimation.karaoke,
};
function calculateDelay(text) {
    const baseDelay = 1e3;
    const delayPerCharacter = 50;
    
    return baseDelay + text.length * delayPerCharacter;
}

export async function promptsAnimateText({title, anim, delay, type = 'M_INFO', titleColor = 'none', titleTypography, border = true, borderColor, titleAnimated}) {
    const finalDelay = delay ?? calculateDelay(titleAnimated);
    const animation = animationMap[anim](titleAnimated);
    
    await new Promise((resolve) => {
        setTimeout(() => {
            animation.stop();
            deleteLastLine();
            msg({
                type,
                title,
                titleColor,
                titleTypography,
                borderColor,
                border,
            });
            resolve();
        }, finalDelay);
    });
}
