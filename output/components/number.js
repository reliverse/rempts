import {
    stdin as input,
    stdout as output,
} from 'node:process';
import readline from 'node:readline/promises';
import {Value} from '@sinclair/typebox/value';
import {colorize} from '../utils/colorize';
import {msg} from '../utils/messages';
import {applyVariant} from '../utils/variants';

const isString = (a) => typeof a === 'string';

export async function numberPrompt(options) {
    const {
        title,
        hint,
        validate,
        defaultValue,
        schema,
        titleColor,
        titleTypography,
        titleVariant,
        content,
        contentColor,
        contentTypography,
        contentVariant,
    } = options;
    
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
            msg({
                type: 'M_ERROR',
                title: 'Please enter a valid number.',
            });
            continue;
        }
        
        let isValid = true;
        let errorMessage = 'Invalid input.';
        
        if (schema) {
            isValid = Value.Check(schema, num);
            if (!isValid) {
                const errors = Value.Errors(schema, num);
                
                if (errors.length > 0) {
                    errorMessage = errors[0]?.message ?? 'Invalid input.';
                }
            }
        }
        
        if (validate && isValid) {
            const validation = await validate(num);
            
            if (!validation) {
                isValid = false;
                errorMessage = isString(validation) ? validation : 'Invalid input.';
            }
        }
        
        if (isValid) {
            rl.close();
            return num;
        }
        
        msg({
            type: 'M_ERROR',
            title: errorMessage,
        });
    }
}
