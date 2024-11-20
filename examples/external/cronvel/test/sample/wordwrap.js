import  from "..";
// @ts-nocheck
var term = .terminal;
//term.wrap( '^GP^re^Yr^um^Mi^bs^bs^ci^ro^mn^ is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.' ) ;
//term.wrap( 'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.' ) ;
//term.wrap( '^GP^re^Yr^um^Mi^bs^bs^ci^ro^mn^ is hereby granted' ) ;
//term.wrapColumn( 10 , 25 ) ;
term.wrap('^GP^re^Yr^um^Mi^bs^bs^ci^ro^mn^ is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.');
term("\n");
term.wrapColumn({ x: 10, width: 25 });
term.wrap('^GP^re^Yr^um^Mi^bs^bs^ci^ro^mn^ is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or portions of the Software.');
//term.wrap( '^GP^re^Yr^um^Mi^bs^bs^ci^ro^mn^ is hereby granted' ) ;
//term.wrap( '^GP^re^Yr^um^Mi^bs^bs^ci^ro^mn^ is hereby granted' ) ;
//term.wrap( '^GP^re^Yr^um^Mi^bs^bs^ci^ro^mn^ is ' )
term("\n");
//term.wrap.noFormat( 'Permission is  ' )
term.wrap("^GP^re^Yr^um^Mi^bs^bs^ci^ro^mn^ is ");
term.wrap.red("hereby granted");
term("\n\n");
