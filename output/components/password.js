import process from 'node:process';
import {Value} from '@sinclair/typebox/value';
import {colorize} from '../utils/colorize';

export async function passwordPrompt(options) {
    const {
        title,
        hint,
        validate,
        schema,
        titleColor,
        titleTypography,
    } = options;
    const coloredTitle = colorize(title, titleColor, titleTypography);
    const question = `${coloredTitle}${hint ? ` (${hint})` : ''}: `;
    
    process.stdout.write(question);
    return new Promise((resolve, reject) => {
        const {stdin} = process;
        const passwordChars = [];
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');
        const onData = async (char) => {
            char = char.toString();
            if (char === '\n' || char === '\r' || char === '') {
                stdin.setRawMode(false);
                stdin.pause();
                process.stdout.write('\n');
                stdin.removeListener('data', onData);
                const password = passwordChars.join('');
                let isValid = true;
                
                if (schema) {
                    isValid = Value.Check(schema, password);
                }
                
                if (validate && isValid) {
                    const validation = await validate(password);
                    
                    if (!validation) {
                        isValid = false;
                    }
                }
                
                if (isValid) {
                    resolve(password);
                } else {
                    resolve(await passwordPrompt(options));
                }
            } else if (char === '') {
                stdin.setRawMode(false);
                stdin.pause();
                stdin.removeListener('data', onData);
                reject(Error('User aborted.'));
            } else if (char === '\x7F' || char === '\b' || char === '\x7F' || char === '\b') {
                if (passwordChars.length > 0) {
                    passwordChars.pop();
                    process.stdout.write('\b \b');
                }
            } else {
                passwordChars.push(char);
                process.stdout.write('*');
            }

        };
        
        stdin.on('data', onData);
    });
}
