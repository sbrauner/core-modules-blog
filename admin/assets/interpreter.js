function checkRun(usr, mode){
    mode = mode || "JS";
    mode = mode.toUpperCase();

    return eval("checkRun"+mode)(usr);
}

function checkRunJS(usr){

    // Eliot/Geir say this should be a call to client-side eval(), and
    // we should keep it as long as there's a syntax error.

    // This is a bad idea. What if we actually invoke client code, like
    // print() or something else horrible?
    try {
        //eval(usr);
    }
    catch(e){
        if(e.toString().match(/SyntaxError/)) return false;
        // We assume that other errors are probably because we're missing stuff
        // client-side that would be there on server-side. So send it over.
    }
    // Either the eval succeeded or the error wasn't syntactic. Either way, OK.
    //return true;

    // Strip strings and regexps
    /* OK, so, when checking for [](){}, first strip regexps and quotes.

       "...." and '....' go away.
       "...\"..." go away. So do '...\'...' and '..."...'.

       We don't care what happens in the place of these strings; we're
       not doing any syntax analysis. For the time being, replace them with
       the empty string.

       /.../[gim] has to go away.

       Be careful of 12 / 1 + [ 1 / 12 ].

       Also, watch out (as usual) for /..\/../.

       A regular expression can't begin after a number or identifier. So we
       could just look for a pair of slashes and then afterwards post-process
       them to skip any that start after a digit or letter.. except that
       there's no way to get the locations of the matches. So..

       /(\d|\w)\s*\// -> "$"

       HA HA HA

       /\/.*\\\// -> "/$"

       THIS IS HOW WE DO SOPHISTICATED SYNTAX ANALYSIS IN JS

       /\/.+\// -> ""

    */
    var repeat = function(s, f){
        var new_s = s;
        do{
            s = new_s;
            new_s = f(s);
        }while(new_s != s);
        return s;
    }
    var newusr = repeat(usr, function(s) { return s.replace(/'.*?\\'/, "'$"); });
    newusr = repeat(newusr, function(s) { return s.replace(/".*?\\"/, '"$'); });
    newusr = repeat(newusr, function(s) { return s.replace(/\/.*?\\\//, "/$"); });
    // Strip strings
    newusr = newusr.replace(/".*?"/g, '""').replace(/'.*?'/g, '""');

    // Replace / after char or digit (division operator) with nonexistent $
    // operator
    newusr = newusr.replace(/(\w|\d)\s*\//g, "$1$");
    // Strip regexes
    newusr = newusr.replace(/\/.*?\/[igm]?/g, '""');

    // simple check right now -- count {/}, [/], (/) and make sure they're equal
    var checkMatch = function(usr, left, right){
        var leftMatch = usr.match(new RegExp(left, "g"));
        if (leftMatch) leftMatch = leftMatch.length;
        else leftMatch = 0;
        var rightMatch = usr.match(new RegExp(right, "g"));
        if (rightMatch) rightMatch = rightMatch.length;
        else rightMatch = 0;
        return leftMatch == rightMatch;
    };
    if(! checkMatch(newusr, "{", "}") ) return false;
    if(! checkMatch(newusr, "\\[", "\\]") ) return false;
    if(! checkMatch(newusr, "\\(", "\\)") ) return false;

    var match = newusr.replace(/""/g, "").match(/[\'\"].*$/);
    if(match)
        return match;

    return true;
}

function checkRunBash(usr){
    // no filtering here yet
    return true;
}