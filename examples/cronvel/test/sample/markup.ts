// @ts-nocheck

const term = require("..").terminal;

term("Custom ^_underline\n");
term("Custom ^[underline]underline\n");
term("This is ^Rred^:.\n");
term("Custom ^[red]red\n");
term("Custom ^[fg:red]red\n");
term("Custom ^[bg:red]red")("\n");
term("Custom ^[#f8a]color\n");
term("Custom ^[fg:#a8f]color\n");
term("Custom ^[bg:#a8f]bg color")("\n");
term("Custom ^[#af8]^[bg:#f8a]fg+bg color")("\n");
term("Custom ^[c:#af8]^[bgColor:#f8a]fg+bg color")("\n");
term("\n");

term("Custom ^[wtf]wtf\n");
term("Custom ^[fg:wtf]wtf\n");
term("\n");
