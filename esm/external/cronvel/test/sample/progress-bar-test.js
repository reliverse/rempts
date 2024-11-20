import termkit from "../../src/termkit.js";
// @ts-nocheck
/* jshint unused:false */
termkit.getDetectedTerminal((error, term) => {
    var progress;
    var progressBar;
    var bullshit = [
        "Serious stuff in progress:",
        "Big Data mining:",
        "Decrunching data:",
        "Building scalable business:",
    ];
    function doProgress() {
        var data = {};
        if (Math.random() < 0.3) {
            data.title = bullshit[Math.floor(Math.random() * bullshit.length)];
        }
        if (progress === undefined) {
            if (Math.random() < 0.1) {
                progress = 0;
            }
            data.progress = progress;
            progressBar.update(data);
            setTimeout(doProgress, 200 + Math.random() * 600);
        }
        else {
            progress += Math.random() / 10;
            data.progress = progress;
            progressBar.update(data);
            if (progress >= 1) {
                setTimeout(() => {
                    term("\n");
                    process.exit();
                }, 2000);
            }
            else {
                setTimeout(doProgress, 5000 + Math.random() * 1000);
            }
        }
    }
    //term.bold( 'Serious stuff in progress: ' ) ;
    progressBar = term.progressBar({
        width: 70,
        percent: true,
        eta: true,
        title: bullshit[Math.floor(Math.random() * bullshit.length)],
        titleSize: 29,
        /*
            barStyle: term.brightGreen.bold ,
            barBracketStyle: term.brightWhite ,
            percentStyle: term.brightMagenta.inverse ,
            barChar: '~' ,
            barHeadChar: '*' ,
    
            //barChar: ' ' ,
            //barHeadChar: ' ' ,
            //barStyle: term.bgCyan
            //*/
    });
    term.column(1);
    doProgress();
});
