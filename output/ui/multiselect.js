import {
    stdin as input,
    stdout as output,
} from 'node:process';
import readline from 'node:readline/promises';
import {Value} from '@sinclair/typebox/value';

export async function multiselectPrompt({choices, schema}) {
    if (!choices || !choices.length) {
        throw Error('Choices are required for multiselect prompt.');
    }
    
    const rl = readline.createInterface({
        input,
        output,
    });
    const question = `Enter your choices (comma-separated numbers between 1-${choices.length}): `;
    
    while (true) {
        const answer = await rl.question(question);
        const selections = answer
            .split(',')
            .map((s) => s.trim());
        const invalidSelections = selections.filter((s) => {
            const num = Number(s);
            return isNaN(num) || num < 1 || num > choices.length;
        });
        
        if (invalidSelections.length > 0) {
            continue;
        }
        
        const selectedValues = selections.map((s) => choices[Number(s) - 1]?.value);
        let isValid = true;
        
        if (schema) {
            isValid = Value.Check(schema, selectedValues);
        }
        
        if (isValid) {
            rl.close();
            return selectedValues;
        }
    }
}
