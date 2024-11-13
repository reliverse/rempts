import {
    stdin as input,
    stdout as output,
} from 'node:process';
import readline from 'node:readline/promises';
import {Value} from '@sinclair/typebox/value';

export async function selectPrompt(options) {
    const {
        choices,
        defaultValue,
        schema,
    } = options;
    
    if (!choices || !choices.length) {
        throw Error('Choices are required for select prompt.');
    }
    
    const rl = readline.createInterface({
        input,
        output,
    });
    const question = `Enter your choice (1-${choices.length})${defaultValue ? ` [${defaultValue}]` : ''}: `;
    
    while (true) {
        const answer = await rl.question(question) || defaultValue;
        const num = Number(answer);
        
        if (isNaN(num) || num < 1 || num > choices.length) {
            continue;
        }
        
        const selectedChoice = choices[num - 1];
        const selectedValue = selectedChoice?.id;
        let isValid = true;
        
        if (schema) {
            isValid = Value.Check(schema, selectedValue);
        }
        
        if (isValid) {
            rl.close();
            if (selectedChoice?.action) {
                await selectedChoice.action();
            }
            
            return selectedValue;
        }
    }
}
