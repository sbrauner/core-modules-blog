/* perform a unix "dig" command 

   example
     print( dig("www.yahoo.com").out );
*/
function dig() {
    return sysexec("dig " + (arguments[0]||"") + (arguments[1]||"") + (arguments[2]||""));
}
