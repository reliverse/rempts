import {
    stdin as input,
    stdout as output,
} from 'node:process';
import readline from 'node:readline/promises';
import {Value} from '@sinclair/typebox/value';
import {colorize} from '../utils/colorize';

export async function datePrompt(options) {
    const {
        title,
        hint,
        validate,
        defaultValue,
        schema,
        titleColor,
        titleTypography,
    } = options;
    
    const rl = readline.createInterface({
        input,
        output,
    });
    const coloredTitle = colorize(title, titleColor, titleTypography);
    const question = `${coloredTitle}${hint ? ` (${hint})` : ''}${defaultValue ? ` [${defaultValue}]` : ''}: `;
    
    while (true) {
        const answer = await rl.question(question) || defaultValue || '';
        const date = new Date(answer);
        
        if (isNaN(date.getTime())) {
            continue;
        }
        
        let isValid = true;
        
        if (schema) {
            isValid = Value.Check(schema, date);
        }
        
        if (validate && isValid) {
            const validation = await validate(date);
            
            if (!validation) {
                isValid = false;
            }
        }
        
        if (isValid) {
            rl.close();
            return date;
        }
    }
}
