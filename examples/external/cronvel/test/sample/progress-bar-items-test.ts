// @ts-nocheck

const fs = require("fs");
const term = require("..").terminal;

var timeFactor = 10;
var progress;
var progressBar;
var queuedFiles = [],
  inProgressFiles = [];

function doProgress() {
  var file;

  if (progress === undefined) {
    if (Math.random() < 0.1) {
      progress = 0;
    }

    progressBar.update(progress);
    setTimeout(doProgress, 2 * timeFactor + Math.random() * 6 * timeFactor);
  } else {
    if (
      queuedFiles.length &&
      (!inProgressFiles.length || Math.random() < 0.5)
    ) {
      //console.log( '\nstartItem\n' ) ;
      file = queuedFiles.shift();
      progressBar.startItem(file);
      inProgressFiles.push(file);
    } else {
      //console.log( '\nitemDone\n' ) ;
      progressBar.itemDone(inProgressFiles.shift());

      if (!inProgressFiles.length && queuedFiles.length) {
        //console.log( '\nstartItem\n' ) ;
        file = queuedFiles.shift();
        progressBar.startItem(file);
        inProgressFiles.push(file);
      }
    }

    if (queuedFiles.length + inProgressFiles.length === 0) {
      setTimeout(() => {
        term("\n");
        process.exit();
      }, 20 * timeFactor);
    } else {
      setTimeout(doProgress, 20 * timeFactor + Math.random() * 20 * timeFactor);
    }
  }
}

//term.bold( 'Analysing files: ' ) ;

progressBar = term.progressBar({
  width: 80,
  percent: true,
  eta: true,
  title: "Analysing files:",
  //inline: true ,
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

//setTimeout( () => progressBar.reset() , 5000 ) ;

term.column(1);

fs.readdir(__dirname, (error, files) => {
  if (error) {
    process.exit(1);
  }
  queuedFiles = files;
  progressBar.update({ items: files.length });
  doProgress();
});
