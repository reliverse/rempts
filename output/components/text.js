import {
    stdin as input,
    stdout as output,
} from 'node:process';
import readline from 'node:readline/promises';
import {Value} from '@sinclair/typebox/value';
import {msg, fmt} from '../utils/messages';

export async function textPrompt(options) {
    const {
        title,
        titleColor,
        titleTypography,
        titleVariant,
        content,
        contentColor,
        contentTypography,
        contentVariant,
        hint,
        schema,
        validate,
        defaultValue = '',
        borderColor = 'none',
        variantOptions,
    } = options;
    
    const rl = readline.createInterface({
        input,
        output,
    });
    const question = fmt({
        type: 'M_GENERAL',
        title,
        titleColor,
        titleTypography,
        titleVariant,
        content,
        contentColor,
        contentTypography,
        contentVariant,
        hint,
        borderColor,
        variantOptions,
    });
    
    const validateAnswer = async (answer) => {
        if (schema && !Value.Check(schema, answer)) {
            return Value.Errors(schema, answer)[0]?.message || 'Invalid input.';
        }
        
        if (validate) {
            const validation = await validate(answer);
            return validation ? true : validation || 'Invalid input.';
        }
        
        return true;
    };
    
    while (true) {
        rl.write(defaultValue);
        const answer = (await rl.question(question)).trim() || defaultValue;
        const validation = await validateAnswer(answer);
        
        if (validation) {
            msg({
                type: 'M_NEWLINE',
                title: '',
                borderColor,
            });
            rl.close();
            return answer;
        }
        
        msg({
            type: 'M_ERROR',
            title: validation,
        });
    }
}
