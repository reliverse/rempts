import {
    stdin as input,
    stdout as output,
} from 'node:process';
import readline from 'node:readline/promises';
import {Value} from '@sinclair/typebox/value';
import {colorize} from '../utils/colorize';
import {applyVariant} from '../utils/variants';

export async function numberPrompt(options) {
    const {
        title,
        hint,
        validate,
        default: defaultValue,
        schema,
        titleColor,
        titleTypography,
        titleVariant,
        content,
        contentColor,
        contentTypography,
        contentVariant,
    } = options;
    
    function setState() {}

    const rl = readline.createInterface({
        input,
        output,
    });
    const coloredTitle = colorize(title, titleColor, titleTypography);
    const coloredContent = content ? colorize(content, contentColor, contentTypography) : '';
    const titleText = applyVariant([coloredTitle], titleVariant);
    const contentText = coloredContent ? applyVariant([coloredContent], contentVariant) : '';
    const promptLines = [titleText, contentText].filter(Boolean);
    const promptText = promptLines.join('\n');
    const question = `${promptText}${hint ? ` (${hint})` : ''}${defaultValue !== void 0 ? ` [${defaultValue}]` : ''}: `;
    
    while (true) {
        const answer = await rl.question(question) || defaultValue;
        const num = Number(answer);
        
        if (isNaN(num)) {
            setState();
            
            continue;
        }
        
        let isValid = true;
        
        if (schema) {
            isValid = Value.Check(schema, num);
        }
        
        if (validate && isValid) {
            const validation = await validate(num);
            
            if (!validation) {
                isValid = false;
            }
        }
        
        if (isValid) {
            rl.close();
            return num;
        }
        
        setState();
    }
}
