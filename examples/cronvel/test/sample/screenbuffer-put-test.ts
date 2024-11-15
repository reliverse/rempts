#!/usr/bin/env node

var termkit = require("..");
var term = termkit.terminal;

term.clear();

var buffer = termkit.ScreenBuffer.create({
  dst: term,
  width: 8,
  height: 8,
  palette: new termkit.Palette(),
}); //.clear() ;

/*
buffer.put( {
		x: 3 ,
		y: 2 ,
		//wrap: true ,
		//attr: { color: 'red' , bgColor: 'brightBlack' , underline: true }
	} ,
	'0123456789'
) ;
//*/

//*
buffer.put(
  {
    x: 0,
    y: 2,
    markup: true,
    wrap: true,
    //attr: { color: 'red' , bgColor: 'brightBlack' , underline: true }
  },
  "0^b1^#^R2^y3^+^#^c4^/5^+67^[bg:*pink]89",
);
//*/

buffer.draw();

term("\n");
