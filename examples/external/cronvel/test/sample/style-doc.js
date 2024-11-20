import  from "..";
// @ts-nocheck
const term = .terminal;
term("\n");
term(" ^+bold^ ^-dim^ ^/italic^ ^_underline^ ^!inverse^ ").strike("strike")("\n");
term(" ^Rred ^Ggreen ^Yyellow ^Bblue ^Mmagenta ^Ccyan\n");
term(" ").bgRed("bgRed")(" ");
term.bgGreen("bgGreen")(" ");
term.bgYellow("bgYellow")(" ");
term.bgBlue("bgBlue")(" ");
term.bgMagenta("bgMagenta")(" ");
term.bgCyan("bgCyan")("\n");
term("\n");
