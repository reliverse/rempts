import process from 'node:process';
import logUpdate from 'log-update';
import {colorize} from '../utils/colorize';

const isNumber = (a) => typeof a === 'number';
const DEFAULT_MESSAGE = 'Press any key to continue...';
const CTRL_C_CODE = 3;

export async function pressAnyKeyPrompt(message = DEFAULT_MESSAGE, options = {}) {
    const {
        ctrlC = 1,
        preserveLog = false,
        hideMessage = false,
    } = options;
    
    if (message) {
        message = `${colorize('\u2502', 'viceGradient')}  ${colorize(message, 'dim')}`;
    }
    
    if (message && !hideMessage) {
        logUpdate(message);
    }
    
    return new Promise((resolve, reject) => {
        const cleanup = () => {
            process.stdin.removeListener('data', handler);
            process.stdin.setRawMode(false);
            process.stdin.pause();
        };
        
        const handleCtrlC = () => {
            if (ctrlC === 'reject') {
                reject(Error('User pressed CTRL+C'));
            } else if (!ctrlC) {
                resolve();
            } else if (isNumber(ctrlC)) {
                process.exit(ctrlC);
            } else {
                throw TypeError('Invalid ctrlC option');
            }

        };
        
        const handler = (buffer) => {
            cleanup();
            if (message && !preserveLog) {
                logUpdate.clear();
            } else {
                logUpdate.done();
                process.stdout.write('\n');
            }
            
            const [firstByte] = buffer;
            
            if (firstByte === CTRL_C_CODE) {
                handleCtrlC();
            } else {
                resolve();
            }
        };
        
        process.stdin.resume();
        process.stdin.setRawMode(true);
        process.stdin.once('data', handler);
    });
}
