// @ts-nocheck

// Characters that are hard to type
// Comments explain how to type it on a linux platform, using a fr layout keyboard

const BIT_DOTS =
  "⠀⠁⠂⠃⠄⠅⠆⠇⡀⡁⡂⡃⡄⡅⡆⡇⠈⠉⠊⠋⠌⠍⠎⠏⡈⡉⡊⡋⡌⡍⡎⡏⠐⠑⠒⠓⠔⠕⠖⠗⡐⡑⡒⡓⡔⡕⡖⡗⠘⠙⠚⠛⠜⠝⠞⠟⡘⡙⡚⡛⡜⡝⡞⡟⠠⠡⠢⠣⠤⠥⠦⠧⡠⡡⡢⡣⡤⡥⡦⡧⠨⠩⠪⠫⠬⠭⠮⠯⡨⡩⡪⡫⡬⡭⡮⡯⠰⠱⠲⠳⠴⠵⠶⠷⡰⡱⡲⡳⡴⡵⡶⡷⠸⠹⠺⠻⠼⠽⠾⠿⡸⡹⡺⡻⡼⡽⡾⡿⢀⢁⢂⢃⢄⢅⢆⢇⣀⣁⣂⣃⣄⣅⣆⣇⢈⢉⢊⢋⢌⢍⢎⢏⣈⣉⣊⣋⣌⣍⣎⣏⢐⢑⢒⢓⢔⢕⢖⢗⣐⣑⣒⣓⣔⣕⣖⣗⢘⢙⢚⢛⢜⢝⢞⢟⣘⣙⣚⣛⣜⣝⣞⣟⢠⢡⢢⢣⢤⢥⢦⢧⣠⣡⣢⣣⣤⣥⣦⣧⢨⢩⢪⢫⢬⢭⢮⢯⣨⣩⣪⣫⣬⣭⣮⣯⢰⢱⢲⢳⢴⢵⢶⢷⣰⣱⣲⣳⣴⣵⣶⣷⢸⢹⢺⢻⢼⢽⢾⢿⣸⣹⣺⣻⣼⣽⣾⣿".split(
    "",
  );
const GROWING_BLOCK = [" ", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
const ENLARGING_BLOCK = [" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"];

export default {
  password: "●", // Currently: the same as blackCircle
  ellispsis: "…",

  forwardSingleQuote: "´", // Altgr + ,
  overscore: "¯", // Altgr + Shift + $
  multiply: "×", // Altgr + Shift + ;
  divide: "÷", // Altgr + Shift + :

  // Arrows
  up: "↑", // Altgr + Shift + u
  down: "↓", // Altgr + u
  left: "←", // Altgr + y
  right: "→", // Altgr + i
  leftAndRight: "↔",
  upAndDown: "↕",
  upLeft: "↖",
  upRight: "↗",
  downRight: "↘",
  downLeft: "↙",
  upLeftAndDownRight: "⤡",
  upRightAndDownLeft: "⤢",

  // Those names are most common in the UTF-8 parlance
  northWest: "↖",
  northEast: "↗",
  southEast: "↘",
  southWest: "↙",
  northWestAndSouthEast: "⤡",
  northEastAndSouthWest: "⤢",

  fullBlock: "█",
  upperHalfBlock: "▀",
  lowerHalfBlock: "▄",

  // Array of 0-8 growing/enlarging blocks
  growingBlock: GROWING_BLOCK,
  enlargingBlock: ENLARGING_BLOCK,

  bitDots: BIT_DOTS,

  // When editing this, update spChars.md doc
  bar: {
    classic: {
      border: ["[", "]"],
      body: ["=", " "],
    },
    classicWithArrow: {
      border: ["[", "]"],
      body: ["=", ">", " "],
    },
    classicWithHalf: {
      border: ["[", "]"],
      body: ["=", " ", "-", "=", " "],
    },
    solid: {
      border: ["^!▉", "▏"],
      body: ["█", ...ENLARGING_BLOCK, " "],
    },
  },

  // When editing this, update spChars.md doc
  box: {
    __fix__: (object) => ({
      vertical: object.vertical || " ",
      horizontal: object.horizontal || " ",
      topLeft: object.topLeft || " ",
      topRight: object.topRight || " ",
      bottomLeft: object.bottomLeft || " ",
      bottomRight: object.bottomRight || " ",
      topTee: object.topTee || " ",
      bottomTee: object.bottomTee || " ",
      leftTee: object.leftTee || " ",
      rightTee: object.rightTee || " ",
      cross: object.cross || " ",
    }),
    plain: {
      vertical: "█",
      horizontal: "█",
      topLeft: "█",
      topRight: "█",
      bottomLeft: "█",
      bottomRight: "█",
      topTee: "█",
      bottomTee: "█",
      leftTee: "█",
      rightTee: "█",
      cross: "█",
    },
    empty: {
      vertical: " ",
      horizontal: " ",
      topLeft: " ",
      topRight: " ",
      bottomLeft: " ",
      bottomRight: " ",
      topTee: " ",
      bottomTee: " ",
      leftTee: " ",
      rightTee: " ",
      cross: " ",
    },
    ascii: {
      vertical: "|",
      horizontal: "-",
      topLeft: "|",
      topRight: "|",
      bottomLeft: "|",
      bottomRight: "|",
      topTee: "-",
      bottomTee: "-",
      leftTee: "|",
      rightTee: "|",
      cross: "+",
    },
    light: {
      vertical: "│",
      horizontal: "─",
      topLeft: "┌",
      topRight: "┐",
      bottomLeft: "└",
      bottomRight: "┘",
      topTee: "┬",
      bottomTee: "┴",
      leftTee: "├",
      rightTee: "┤",
      cross: "┼",
    },
    lightRounded: {
      vertical: "│",
      horizontal: "─",
      topLeft: "╭",
      topRight: "╮",
      bottomLeft: "╰",
      bottomRight: "╯",
      topTee: "┬",
      bottomTee: "┴",
      leftTee: "├",
      rightTee: "┤",
      cross: "┼",
    },
    heavy: {
      vertical: "┃",
      horizontal: "━",
      topLeft: "┏",
      topRight: "┓",
      bottomLeft: "┗",
      bottomRight: "┛",
      topTee: "┳",
      bottomTee: "┻",
      leftTee: "┣",
      rightTee: "┫",
      cross: "╋",
    },
    double: {
      vertical: "║",
      horizontal: "═",
      topLeft: "╔",
      topRight: "╗",
      bottomLeft: "╚",
      bottomRight: "╝",
      topTee: "╦",
      bottomTee: "╩",
      leftTee: "╠",
      rightTee: "╣",
      cross: "╬",
    },
    dotted: {
      vertical: "┊",
      horizontal: "┄",
      topLeft: "┌",
      topRight: "┐",
      bottomLeft: "└",
      bottomRight: "┘",
      topTee: "┬",
      bottomTee: "┴",
      leftTee: "├",
      rightTee: "┤",
      cross: "┼",
    },
  },

  // When editing this, update spChars.md doc
  animation: {
    asciiSpinner: ["│", "/", "-", "\\"],
    lineSpinner: ["│", "/", "─", "\\"],
    dotSpinner: [
      BIT_DOTS[7],
      BIT_DOTS[19],
      BIT_DOTS[49],
      BIT_DOTS[112],
      BIT_DOTS[224],
      BIT_DOTS[200],
      BIT_DOTS[140],
      BIT_DOTS[14],
    ],
    bitDots: BIT_DOTS,
    impulse: ["∙∙∙", "●∙∙", "∙●∙", "∙∙●", "∙●∙", "●∙∙", "∙∙∙", "∙∙∙"],
    unboxing: [
      " ",
      "▁",
      "▂",
      "▃",
      "▄",
      "▅",
      "▆",
      "▇",
      "█",
      "▉",
      "▊",
      "▋",
      "▌",
      "▍",
      "▎",
      "▏",
    ],
    "unboxing-color": [
      "^r^#^b ",
      "^r^#^b▁",
      "^r^#^b▂",
      "^r^#^b▃",
      "^r^#^b▄",
      "^r^#^b▅",
      "^r^#^b▆",
      "^r^#^b▇",
      "^r^#^m█",
      "^r^#^m▉",
      "^r^#^m▊",
      "^r^#^m▋",
      "^r^#^m▌",
      "^r^#^m▍",
      "^r^#^m▎",
      "^r^#^m▏",
      "^m^#^y█",
      "^m^#^y▇",
      "^m^#^y▆",
      "^m^#^y▅",
      "^m^#^y▄",
      "^m^#^y▃",
      "^m^#^y▂",
      "^m^#^y▁",
      "^b^#^y ",
      "^b^#^y▏",
      "^b^#^y▎",
      "^b^#^y▍",
      "^b^#^y▌",
      "^b^#^y▋",
      "^b^#^y▊",
      "^b^#^y▉",
    ],
  },

  blackSquare: "■",
  whiteSquare: "□",
  blackCircle: "●",
  whiteCircle: "○",
  blackUpTriangle: "▲",
  whiteUpTriangle: "△",
  blackDownTriangle: "▼",
  whiteDownTriangle: "▽",
  blackLeftTriangle: "◀",
  whiteLeftTriangle: "◁",
  blackRightTriangle: "▶",
  whiteRightTriangle: "▷",
  blackDiamond: "◆",
  whiteDiamond: "◇",
  blackStar: "★",
  whiteStar: "☆",
  spadeSuit: "♠",
  heartSuit: "♥",
  diamondSuit: "♦",
  clubSuit: "♣",

  // Powerline specific characters (https://powerline.readthedocs.io)
  // It is displayed only with the appropriate font
  powerline: {
    branch: "",
    line: "",
    readOnly: "",
    rightTriangleSeparator: "",
    rightArrowSeparator: "",
    leftTriangleSeparator: "",
    leftArrowSeparator: "",
  },
};
