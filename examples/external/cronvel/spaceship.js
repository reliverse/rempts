import termkit from "../lib/termkit";
// @ts-nocheck
var term;
var ScreenBuffer = termkit.ScreenBuffer;
// Buffers
var viewport, sprites = {};
function init(callback) {
    termkit.getDetectedTerminal(function (error, detectedTerm) {
        if (error) {
            throw new Error("Cannot detect terminal.");
        }
        term = detectedTerm;
        viewport = new ScreenBuffer({
            dst: term,
            width: Math.min(term.width),
            height: Math.min(term.height - 1),
            y: 2,
        });
        createBackground();
        createSpaceship();
        //term.fullscreen() ;
        term.moveTo.eraseLine.bgWhite.green(1, 1, "Arrow keys: move the ship - Q/Ctrl-C: Quit\n");
        term.hideCursor();
        term.grabInput();
        term.on("key", inputs);
        callback();
    });
}
function terminate() {
    //term.fullscreen( false ) ;
    term.hideCursor(false);
    term.grabInput(false);
    setTimeout(function () {
        term.moveTo(1, term.height, "\n\n");
        process.exit();
    }, 100);
}
function createBackground() {
    sprites.background = new ScreenBuffer({
        width: viewport.width * 4,
        height: viewport.height,
        noFill: true,
    });
    sprites.background.fill({ attr: { color: "white", bgColor: "black" } });
    //sprites.background.fill( { attr: { defaultColor: true , bgDefaultColor: true } } ) ;
    /*
      sprites.planet = ScreenBuffer.createFromChars(
          { attr: { color: 'yellow' , bold: false } , transparencyChar: ' ' } ,
          fs.readFileSync( __dirname + '/data/saturn.txt' )
      ) ;
      //*/
    sprites.planet = ScreenBuffer.loadSync(__dirname + "/data/saturn.sbuf");
    createBackgroundStars(sprites.background.width * sprites.background.height * 0.004);
    createBackgroundTrails(sprites.background.width * sprites.background.height * 0.008);
    createBackgroundPlanets(sprites.background.width * sprites.background.height * 0.0001);
}
function createBackgroundTrails(nTrails) {
    var i, j, x, y, length;
    for (i = 0; i < nTrails; i++) {
        x = Math.floor(Math.random() * sprites.background.width);
        y = Math.floor(Math.random() * sprites.background.height);
        length = 3 + Math.floor(Math.random() * 8);
        for (j = 0; j < length; j++) {
            sprites.background.put({
                x: (x + j) % sprites.background.width,
                y: y,
                attr: { color: "gray", bgColor: "black" },
            }, "-");
        }
    }
}
function createBackgroundStars(nStars) {
    var i, x, y, c, char, stars = ["*", ".", "o", "+", "°"];
    for (i = 0; i < nStars; i++) {
        x = Math.floor(Math.random() * sprites.background.width);
        y = Math.floor(Math.random() * sprites.background.height);
        char = stars[Math.floor(Math.random() * stars.length)];
        c = Math.floor(Math.random() * 16);
        sprites.background.put({
            x: x,
            y: y,
            attr: { color: c, bgColor: "black" },
        }, char);
    }
}
function createBackgroundPlanets(nPlanets) {
    var i, x, y;
    for (i = 0; i < nPlanets; i++) {
        x = Math.floor(Math.random() * sprites.background.width);
        y = Math.floor(Math.random() * sprites.background.height);
        sprites.planet.draw({
            dst: sprites.background,
            x: Math.floor(x - sprites.planet.width / 2),
            y: Math.floor(y - sprites.planet.height / 2),
            blending: true,
            wrap: "x",
        });
    }
}
function createSpaceship() {
    /*
      sprites.spaceship = ScreenBuffer.createFromChars(
          { attr: { color: 'cyan' , bold: true } , transparencyChar: '#' , transparencyType: ScreenBuffer.TRANSPARENCY } ,
          fs.readFileSync( __dirname + '/data/spaceship1.txt' )
      ) ;
      */
    sprites.spaceship = ScreenBuffer.loadSync(__dirname + "/data/spaceship1.sbuf");
    sprites.spaceship.x = 3;
    sprites.spaceship.y = Math.floor(viewport.height / 2 - sprites.spaceship.height / 2);
}
function inputs(key) {
    switch (key) {
        case "UP":
            sprites.spaceship.y--;
            break;
        case "DOWN":
            sprites.spaceship.y++;
            break;
        case "LEFT":
            sprites.spaceship.x--;
            break;
        case "RIGHT":
            sprites.spaceship.x++;
            break;
        case "q":
        case "CTRL_C":
            terminate();
            break;
    }
}
function nextPosition() {
    sprites.background.x--;
}
var frames = 0;
function draw() {
    sprites.background.draw({ dst: viewport, tile: true });
    sprites.spaceship.draw({ dst: viewport, blending: true, wrap: "both" });
    var stats = viewport.draw({ delta: true });
    //var stats = viewport.draw() ;
    term.moveTo.eraseLine.bgWhite.green(1, 1, "Arrow keys: move the ship - Q/Ctrl-C: Quit - Redraw stats: %d cells, %d moves, %d attrs, %d writes\n", stats.cells, stats.moves, stats.attrs, stats.writes);
    frames++;
}
function animate() {
    draw();
    nextPosition();
    setTimeout(animate, 50);
}
init(function () {
    animate();
});
