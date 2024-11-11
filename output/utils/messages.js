import {symbol} from './symbols.js';

export function fmt(type, state = 'initial', text = '', dashCount) {
    const ss = {
        start: symbol('S_START', state),
        dash: symbol('S_LINE', state),
        bar: symbol('S_MIDDLE', 'initial'),
        icon: symbol('S_STEP_ACTIVE', state),
        end: symbol('S_END', state),
    };
    
    switch(type) {
    case 'MT_START':
        const longLine = dashCount ? ss.dash.repeat(dashCount) : '';
        return `${ss.start}${ss.dash} ${text} ${longLine}`;
    
    case 'MT_MIDDLE':
        return `${ss.bar}
${ss.icon}  ${text}`;
    
    case 'MT_END':
        return `${ss.end}  ${text}`;
    
    default:
        throw Error(`Unhandled MsgType type: ${type}`);
    }
}

export function msg(type, state, text, dashCount) {
    const logger = state === 'error' ? console.warn : console.log;
    logger(fmt(type, state, text, dashCount));
}
