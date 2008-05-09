/* php2js

 */

core.util.object();
core.util.array();
core.util.string();
core.core.file();

tojsonfull = tojson;
function ourtojson(x) { 
    var s = "" + tojsonfull(x);
    return s.replace(/\n.*/g, "...");
}
tojson = ourtojson;

function clone(x) { 
    //return Object.extend({}, x);
    return x.clone();
}

// -------------------------------------------------------------------

var __file__ = "";
var inphp = 0; // in code block, or html mode?
var indents = 0;

function indent() { 
    var s = "";
    for( var i = 0; i < indents; i++ )
	s += "  ";
    return s;
}

// -------------------------------------------------------------------

output = "";
input = "";
pos = 0; // input position

function lineNumber() { 
    return 1 + input.substring(0, pos).nOccurrences('\n');
}

function printContext() { 
    print("line " + lineNumber() + ":");
    var p = pos-1;
    var pad = "";
    while( p > 0 && input[p] != '\n' ) { 
	p--;
	pad = (input[p] == '\t' ? '\t' : ' ') + pad;
    }
    p++;
    print("    " + pad + "*");
    printnoln("    ");
    for( var i = 0; i < 200; i++ ) { 
	if( p+i>=input.length )
	    break;
	var ch = input[p+i];
	if( ch == '\n' ) {
	    if( i > 120 )
		break;
	    printnoln("\n    ");
	}
	    else
		printnoln(ch);
    }
    print('\n');
}

function say(x) { 
    output += x;
}
function sayTight(x) { 
    output = output.rtrim() + x;
}

// kind of like peek(), but not a single char.
function peekStream() { 
    return input.substring(pos);
}

function skipRequiredChar(x) { 
    var ch = get();
    if( ch != x ) 
	throw { unexpected: ch, wanted: x };
}

// returns true if skipped
function skipOptionalChar(x) { 
    var ch = peek();
    if( ch == x ) { 
	pop();
	return x;
    }
    return false;
}

function _skipTo(patt) { 
    var s = peekStream();
    var i = s.indexOf(patt);
    if( i < 0 ) { 
	throw("eof");
    }
    pos += i;
    var res = s.substring(0, i);
    return res;
}

function skipTo(patt, suppress) { 
    var s = peekStream();
    var i = s.indexOf(patt);

    if( i < 0 ) { 
	say(s);
	throw("eof");
    }
    var res = s.substring(0, i);
    if( !suppress )
	say(res);
    pos += i;
}
function skipToAndEat(patt, suppress) { 
    skipTo(patt, suppress);
    pos += patt.length;
}

/* sayskipped
     -1 return whitespace
     0 skip; don't output it (default behavior)
     1 skip, but output
*/
function peek(sayskipped) { 
    var il = input.length;
    while( 1 ) {
	if( pos >= il )
	    throw "eof";
	if( (input[pos] == ' ' || input[pos] == '\t' || input[pos] == '\n') && sayskipped >= 0 ) { 
	    if( sayskipped ) say(input[pos]);
	    pos++; continue; 
	}
	return input[pos];
    }
}

/* get prev char */
function prev(nback, sayskipped=0) { 
    var i = pos - (nback||1);
    while( 1 ) { 
	if( i < 0 ) return null;
	if( (input[i] == ' ' || input[i] == '\t' || input[i] == '\n') && sayskipped >= 0 ) { 
	    ;
	}
	else { 
	    break;
	}
	i--;
    }
    return input[i];
}

function get(sayskipped) { 
    var ch = peek(sayskipped);
    pos++;
    return ch;
}

function pushback() { 
    pos--; 
}
function pop() { get(-1); }

/* run some code which outputs characters via say(); then return what 
   was output.
*/
function snoop(f) { 
    var len = output.length;
    f();
    return output.substring(len);
}

// -------------------------------------------------------------------

identTranslations = { 
    "interface": "$interface",
    "var": "$var"
};

varTranslations = { 
    GLOBALS: "globals",
    _GET: "_get()",
    _REQUEST: "request",
    _SERVER: "_server()",
    "class": "$class",
    "interface": "$interface",
    "var": "$var",
    "return": "$return",
    "function": "$function",
    "false": "$false", 
    "true": "$true"
};

// -------------------------------------------------------------------
// Tokens

function runAction(tok) { 
    if( isString(tok.action) ) say(tok.action);
    else
	tok.action();
}

// $SOMEVAR
variable = { type: "variable", name: "" ,
	     action: doVariable,
	     init: function() 
	     { 
		 if( varTranslations[this.name] )
		     this.name = varTranslations[this.name];
	     }
};

number = { type: "number", str: "",
	   action: function() { say(this.str); }
};

other = { type: "other", str: "" } ; /* unclassified single char's */

phpend = { type: "phpend" } ; // "?>"

arrow = { type: "arrow", action: ":" } ; // =>

linecomment = { type: "linecomment" }; // // or #

blockcomment = { type: "blockcomment" }; // slash *

singlequotestr = { type: "singlequotestr", stringval: "",
		   action: function() 
		   { 
		       say("'"); say(this.stringval); say("'");
		   }
};

doublequotestr = { type: "doublequotestr", stringval: "", action: doDoubleQuote };

/* keywords */
phplist = { type: "list", action: doList };
phppush = { type: "[]", action: doPush };
phpref = { type: "&", action: doRef } ;
phpassign = { type: "=", action: doAssign };
phpvar = { type: "var", action: doVar };
phpor = { type: "or", action: "||" };
phpand = { type: "and", action: "&&" };
phpcontinue = { type: "continue", action: doContinue };
phpbreak = { type: "break", action: doBreak };
phpfunction = { type: "function", action: doFunction };
phppublic = { type: "public", action: "/*public*/" };
phpprivate = { type: "private", action: "/*private*/" };
phpstatic = { type: "static", action: doStatic };
phpclass = { type: "class", action: doClass };
phpextends = { type: "extends", action: "extends?" };
as = { type: "as" };
_final = { type: "final", action: "/*final*/" };
file = { type: "__file__", action: function() { say("'"+__file__+"'"); } };
define = { type: "define", action: doDefine };
require_once = { type: "require_once", action: doRequireOnce };
include_once = { type: "include_once", action: doRequireOnce };
include = { type: "include", action: doInclude }; // include "foo";
require = { type: "require", action: doInclude }; // include "foo";
foreach = { type: "foreach", action: forEach };
array = { type: "array", action: doArray };
echo = { type: "echo", action: doEcho };
keywords = [ define, require_once, include_once, require, include, foreach, array, echo,
	     file, as, _final, phpclass, phpstatic, phpprivate, phppublic, phpfunction, phpextends,
	     phpbreak, phpcontinue, phpand, phpor, phpvar, phpassign, phpref, phplist
];


// -------------------------------------------------------------------
// lexical

function isWhitespaceTok(t) { 
    return t.type == "other" && 
	(t.str == ' ' || t.str == '\t' || t.str == '\n' || t.str == '\r');
}

// set stringval to the string up to 'delimiter'
// tokobj is an examplar of the obj type we want
function strToTok(delimiter, tokobj) { 
    tokobj = clone(tokobj);
    tokobj.stringval = "";
    while( 1 ) { 
	var ch = get(-1);
	if( ch == delimiter ) break;
	tokobj.stringval += ch;
	if( ch == '\\' )
	    tokobj.stringval += get(-1);
    }
    return tokobj;
}

// true if ' ' etc.
function delimChar(ch) {
    return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_".indexOf(ch) < 0;
}

function getidentifier() { 
    var id = "";
    while( 1 ) { 
	var ch = peek(-1);
	if( delimChar(ch) ) break;
	id += ch;
	pop();
    }
    return identTranslations[id] ? identTranslations[id] : id;
}

/* like getidentifier, but skips past white space to find an identifier */
function nextidentifier() { 
    var ch = get(0);
    if( delimChar(ch) ) return ch;
    var id = ch + getidentifier();
    return identTranslations[id] ? identTranslations[id] : id;
}

/* helper: if str matches, return a token of type tokobj */
function tokmatch(str, tokobj) { 
    var s = peekStream();
    if( !s.startsWithLC(str) ) return null;
    if( !delimChar(s[str.length]) ) return null;
    pos += str.length;
    return clone(tokobj);
}

function makeNumberToken(ch) { 
    var s = ch;
    var dots = 0;
    while( 1 ) { 
	ch = peek(-1);
	if( ch == '.' ) { 
	    if( ++dots > 1 )
		break;
	}
	else if( !isDigit(ch) )
	    break;
	s += ch;
	pop();
    }
    var n = clone(number);
    n.str = s;
    return n;
}

var onWordBreak = true;

function _tok(sayskipped) {
    var wasWordBreak = onWordBreak;
    onWordBreak = true;
    var pold = pos;
    var ch = get(sayskipped);
    wasWordBreak |= pos-pold>1;
    if( isDigit(ch) || (ch == '-' && isDigit(peek(-1))) ) { 
	return makeNumberToken(ch);
    }
    else if( ch == '=' && peek(-1) == '>' ) { 
	get(-1); return clone(arrow);
    }
    else if( ch == '?' ) { 
	if( peek(-1) == '>' ) { get(); return clone(phpend); }
    }
    else if( ch == '#' ) { 
	return clone(linecomment);
    }
    else if( ch == '/' ) { 
	if( peek(-1) == '*' ) { get(); return clone(blockcomment); }
	if( peek(-1) == '/' ) { get(); return clone(linecomment); }
    }
    else if( ch == '"' ) { return strToTok('"', doublequotestr); }
    else if( ch == "'" ) { return strToTok("'", singlequotestr); }
    else if( ch == '$' ) { 
	var tk = clone(variable);
	tk.name = getidentifier();
	tk.init();
	return tk;
    }
    else if( ch == '[' && peek() == ']' ) { 
	get();
	return clone(phppush);
    }
    else if( ch == '&' ) { 
	return clone(phpref);
    }
    else if( wasWordBreak ) {
	pushback();
	for( var i = 0; i < keywords.length; i++ ) { 
	    var examplar = keywords[i];
	    var tk = tokmatch(examplar.type, examplar);
	    if( tk ) 
		return tk;
	}
	pop();
    }
    var res = clone(other);
    res.str = ch;//.toLowerCase();
    onWordBreak = delimChar(res.str);
    return res;
}
function tok(sayskipped) {
    var t = _tok(sayskipped);
    //        print(tojson(t));
    return t;
}

function getString(sayskipped) {
    var t = tok(sayskipped);
    if( !t.stringval ) throw { unexpected: t, wanted: "string literal" };
    return t.stringval;
}

/* todo: it is ok if a comment is in front of some other expected token. 
   when that is true, just write out the comment and skip over.
*/
function expect(exptoken, str, skipws) { 
    var t = tok();
    if( t.type != exptoken.type || (str && t.str != str) ) {
	//	if( skipws && isWhitespaceTok(t) ) { 
	//	    t = tok(); 
	//	    continue;
	//	}

	print("expected: " + exptoken.type + ' ' + (str?str:""));
	print("got: " + tojson(t));
	throw { unexpected: t, wanted: exptoken.type + ' ' + (str?str:"") };
    }
    return t;
}

function expectStr(s) {
    var skipws = true;
    s.forEach(function(x){expect(other,x,skipws); skipws=false;});
}

// -------------------------------------------------------------------

function escape(str) { 
    return str.replace(/\n/g, "\\n");
}

// note for "$FOO z" we output ""+FOO+" z" and that is good because it forces
// conversion of FOO to string type
//
function doDoubleQuote() {
    var pc = this.stringval.split(/\$/);
    say( '"' + escape(pc.car()) + '"' );
    pc.cdr().forEach(function(x) 
		     {
			 var rest = null;
			 for( var i = 0; i < x.length; i++ ) {
			     if( delimChar(x[i]) ) {
				 rest = i;
				 break;
			     }
			 }
			 var v = rest ? x.substring(0,rest) : x;
			 if( varTranslations[v] ) 
			     v = varTranslations[v];
			 say('+' + (v.length?v:"$"));
			 if( rest )
			     say('+"' + escape(x.substring(rest)) + '"');
		     });
};

function doVariable() { 
    say( this.name);
}

// list($action, $to, $from, $from_relation) = $rel_data;
// TODO finish
function doList() { 
    expectStr("(");
    skipToAndEat(")", "suppress");
    say("__list_not_done__");
}

// $VAR[] =
function doPush() {
    //    print("DOPUSH" + input.substring(pos, pos+20));
    if( peek() == '=' ) {
	get();

	// $foo[] = 
	say('.push(');
	//	if( peek() == '&' ) get();
	doStatement();
	say(')');
    }
}

function doRef() { 
    var ch = prev(2);
    //    print("DOREF " + ch);
    if( ch == '=' || ch == '(' || ch ==',' )
	return;
    say("&");
}

function doAssign() { 
    say("=");
}

var didConstructor = false;
var className = "?";
var baseClass = null;
var inClass = 0;

function doFunction() { 
    if( inClass ) { 
	var nm = nextidentifier();
	if( nm == '&' ) {
	    nm = nextidentifier();
	}
	if( nm == className ) { 
	    didConstructor = true;
	    say(nm + " = function");
	    if( baseClass ) say(" this.superclass(); "); 
	}
	else { 
	    say(className + ".prototype.");
	    say(nm + " = function");
	}
    }
    else
	say("function");
}

function doVar() {
    if( inClass ) {
	say("/* var");
	doStatement();
	expectStr(';'); say(";");
	say("*/");
    }
    else { 
	say("var");
    }
}

// class foo {
function doClass() { 
    didConstructor = false;
    baseClass = null;
    var nm = nextidentifier();

    if( peek() != '{' ) { 
	var t = expect(phpextends);
	var baseClass = nextidentifier();
    }

    print("class " + nm);

    say("/*class " + nm + (baseClass?" extends "+baseClass:"") + "*/\n");

    inClass++;
    className = nm;
    doBlock("quiet");
    className = "??";
    inClass--;

    /* constructor */
    if( !didConstructor ) { 
	say(nm + " = function() {");
	if( baseClass ) say(" this.superclass(); "); 
	say("}\n");
    }

    /* inheritance */
    if( baseClass ) { 
	say("\n/*inheritance*/\n");
	say(nm + ".prototype = Object.extend({}, "+baseClass+".prototype);\n");
	//say(nm + ".prototype = " + baseClass + ".prototype.clone();\n");
	say(nm + ".prototype.constructor = " + nm + ";\n");
    }
}

//    static private $_registry = null;
//    static public function loadClass($class, $dirs = null)
function doStatic() { 
    var t = tok();
    if( t.type == "public" || t.type == "private" ) 
	t = tok();
    say(className + ".");
    if( t.type == "function" )
	say(nextidentifier() + " = function");
    else
	runAction(t);
}

// define('PEAR_ERROR_RETURN',     1);
function doDefine() {
    expectStr("(");
    var l = getString(1);
    expectStr(",");
    say(l/*.toLowerCase()*/ + " = ");
    doStatement(')', '(');
    expectStr(')');
}

function mark() { 
    return { p: pos };
}
function rewind(mk) { 
    pos = mk.p;
}

var casts = { 
    "array": "array",
    "int": "int", "integer": "int",
    "bool": "bool", "boolean": "bool",
    "float": "float", "double": "float", "real": "float",
    "string": "string", "binary": "binary", "object": "object"
}

// (array)$z
// (int) $z
// http://us3.php.net/manual/en/language.types.type-juggling.php
function tryCast() { 
    var mk = mark();
    var t = nextidentifier();
    var castType = casts[t];
    if( castType ) {
	var p = tok();
	if( p.str == ')' ) { 
	    say("cast" + castType + "(");  // castArray(z);
	    var v = tok();
	    runAction(v);
	    say(")");
	    return true;
	}
    }
    // not a cast
    rewind(mk);
    return false;
}

function _includeParam() { 
    var skipped = skipOptionalChar('(');

    var x = filePrefix + getString();
    print("X:" + x);
    x = x.lessSuffix(".inc");
    x = x.lessSuffix(".php");
    x = x.lessPrefix("./");
    x = x.replace(/\//g, '.');

    if( skipped ) skipRequiredChar(')');

    return x;
}

function doInclude(once) {
    var mk = mark();
    try { 
	if( once ) throw { unexpected: "once" };
	// try to do literal syntax which is more readable etc.
	say("jxp." + _includeParam() + "()");
    }
    catch( e if isObject(e) && e.unexpected ) { 
	// do nonliteral syntax
	rewind(mk);
	say("require(");
	if( peek() == '(' ) { 
	    get();
	    doStatement(")", "(");
	    if( once ) say(once); else say(", null");
	    say(", '" + filePrefix + "'");
	}
	else {
	    doStatement();
	    if( peek() == ';' ) get();
	    if( once ) say(once); else say(", null");
	    say(", '" + filePrefix + "'");
	    say(");");
	}
    }
}

function doRequireOnce() { 
    doInclude(", 'once'");
}

// php echo stmt
function doEcho() { 
    say("echo");
    if( peek() == '(' ) return;

    say('(');
    doStatement();
    sayTight(")");
    if( peek() != ';' ) say(";");
}

/* returns a variable name but can be things like
     foo
     foo->bar
     foo[3]
*/
function sayComplexVariable(inner) { 
    if( inner ) { 
	var id = getidentifier();
	if( id == "" )
	    throw { unexpected: id, wanted: "identifier after ->" };
	say(id);
    }
    else {
	var v = expect(variable);
	say( v.name );
    }

    if( peek() == '-' ) { 
	pop(); 
	if( peek(-1) == '>' ) { 
	    pop();
	    say('.');
	    sayComplexVariable("inner");
	}
	else
	    push_back();
    }
    else if( peek() == '[' ) { 
	pop();
	say('[');
	doStatement(']', '[');
	expectStr(']');
	say(']');
    }
}

function markOutput() { 
    var pos = output.length;
    return function() { return pos; }
}
function injectInOutput(marker, str) {
    output = output.insert(marker(), str);
}

// array(1,2,3)
function doArray() {
    expectStr("(");

    var border = [ '[', ']' ];
    var mk = mark();
    while( 1 ) { 
	var t = tok();
	if( t.str == ")" )
	    break;
	if( t.type == "arrow" ) { 
	    border = [ '{', '}' ];
	    break;
	}
    }
    rewind(mk);

    say(border[0]);
    php(')', '(');
    expectStr(")");
    say(border[1]);
}

var inForEach = false;

// break in for, foreach, while, do-while or switch structure.
function doBreak() { 
    if( inForEach ) 
	say('breakForEach()');
    else
	say("break");
}
function doContinue() { 
    if( inForEach ) 
	say('return');
    else
	say("continue");
}

// php foreach( $a as $b [=> $c]  ) { }
function forEach() { 
    expectStr("(");
    var mko = markOutput();
    doStatement(as);
    expect(as);

    var k = expect(variable); // $b
    var tk = tok(0);
    if( tk.type == "arrow" ) { 
	var v = expect(variable); // $c
	expectStr(")");
	injectInOutput(mko, "foreachkv(");
	say(", function("); 
	say(k.name + "," + v.name + ") ");  // foreachkv(a, function(b,c)) ...
    }
    else { 
	if( tk.str != ')' ) throw { unexpected: tk, wanted: ")" };
	injectInOutput(mko, "foreach(");
	say(", function(");
	say(k.name);
	say(") ");  // foreach(a, function(b)) ...
    }

    var feold = inForEach;
    inForEach = true;
    doBlock();
    inForEach = feold;
    say(" );");
}
/*
function forEachOld() { 
    expectStr("(");
    var coll = snoop( sayComplexVariable );
    expectStr("as");
    var k = expect(variable);
    say(".forEach( function(" + k.name + ") { ");

    var tk = tok(0);
    var v = null;
    if( tk.str == "=" ) { 
	expectStr(">");
	v = expect(variable);
	expectStr(")");
    }
    else if( tk.str != ")" )
	throw { unexpected: tk, wanted: ")" };
    expectStr("{");

    if( v ) { 
	say("\n  " + indent() + "var " + v.name + " = " + coll + "[" + k.name + "];\n");
    }

    doBlock();

    say(");");
    }*/
	
// -------------------------------------------------------------------

function skipToPhpTag() { 
    skipToAndEat("<?");
    if( peek(-1) == 'p' ) { 
	get(-1); get(-1); get(-1);
    }
    inphp++;
}

function doHtml() { 
    skipToPhpTag();
    say("<%");
}

/* endOn - character to stop processing the block on, and return.  however, 
           we can nest in further if starter chars are encountered.
           Can also be a token.

   eg you could call:

     php('}', '{');
     php(';', null);
*/
function php(endOn, starter) {
    var mydepth = 0;
    while( 1 ) { 
	try { 
	    var t = tok(1);
	    if( isObject(endOn) && t.type == endOn.type ) { 
		assert( t.type == "as" );
		pushback(); pushback();
		return t;
	    }
	    if( t.type == "other" ) {
		if( t.str == '(' && tryCast() )
		    continue;
		if( t.str == ':' && peek(-1) == ':' ) { 
		    get(-1); say('.'); continue; // ::
		}
		if( t.str == '-' && peek(-1) == '>' ) { 
		    get(-1); say('.'); continue; // ->
		}
		if( t.str == '.' ) { say("+"); continue; } // string concat
		if( t.str == starter )
		    mydepth++;
		else if( t.str == endOn ) { 
		    if( --mydepth < 0 ) {
			pushback();
			return;
		    }
		}
		say(t.str);
		continue;
	    }
	    if( t.type == "phpend" ) {
		inphp--; assert( inphp >= 0 );
		if( endOn ) { 
		    pushback(); pushback(); return;
		}
		say("%>");
		doHtml();
		continue;
	    }
	    if( t.type == "blockcomment" ) { 
		say("/*"); skipTo("*/"); continue;
	    }
	    if( t.type == "linecomment" ) { 
		say("//"); skipTo("\n"); continue;
	    }
	    if( t.action ) { 
		runAction(t); continue;
	    }
	    printnoln("***unhandled token:");
	    print(tojson(t)+"\n");
	    printContext();
	    throw "stopping";
	} catch( e if isObject(e) && e.unexpected ) { 
	    print("unexpected exception");
	    print(tojson(e));
	    printContext();
	    // TEMP: don't have to stop
	    throw "stopping";
	}
    }
}

/* run until end of statement. we are looking for a semicolon or ?> to terminate.
 */
function doStatement(endchar, starter) { 
    endchar = endchar || ';';
    php(endchar, starter);
}

/* we just started a { block } of code. (past the '{').
   process, then return. 
*/
function doBlock(quiet) { 
    expectStr("{"); 
    if( !quiet ) say("{");
    indents++;
    php('}', '{');
    indents--;
    expectStr("}"); 
    if( !quiet ) say("}"); 
}

// html mode at first.
function top() {
    try { 
	while( 1 ) {
	    skipToPhpTag();
	    say("<%");
	    php();
	}
    }
    catch( e if e == "eof" ) { 
    }

    if( inphp ) { 
	print("eof in php mode. adding %>");
	say("\n%>\n");
    }
}

//-----------------------------------------------------

function tojs(php, fname) { 
    assert(fname);
    __file__ = fname;
    filePrefix = fname.replace(/^\/data\/sites\/[^\/]+\//, "");
    if( filePrefix.indexOf('/') >= 0 )
	filePrefix = filePrefix.replace(/\/[^\/]+$/, "/");
    else
	filePrefix = "";
    //    print("fname:" + fname);
    //    print("fprefix:" + filePrefix);

    output = "";
    input = php;
    //    print(input); print("-----------------------------------");
    pos = 0;
    inphp = 0;
    top();
    return output;
}

//print( tojs('foo \n<?php x=2; \nin_Array(1,2);\n', "/data/sites/kz") );
//print( tojs('foo \n<?php x=2; \ninclude "includes/init.inc"; \n?> bar') );
//print( tojs("<?php\nforeach( $x->goo as $y=>$z ) { }", "/data/sites/kz") );
//print( tojs("<?php\nforeach( $x[$z] as $y ) { }", "/data/sites/kz") );


//var fname = "/data/sites/php/popslamui/lib/Config.php";
//var fname = "/data/sites/php/popslamui/lib/Cache/Cache.php";
//var fname = "/data/sites/php/popslamui/lib/Cache/PEAR.php";
var fname = javaStatic( "java.lang.System" , "getenv", "fname" );
//    "/data/sites/php/www/index.php";

try { 
    var f = openFile( fname );
    var code = f.getDataAsString();
}
catch(e) { 
    print("couldn't open/read " + fname);
    exit();
}
var res = tojs(code, fname);

// output
var f = File.create(res);
var outname = fname.replace(/\.(php|inc)$/, ".jxp");
if( outname != fname ) {
    f.writeToLocalFile(outname);
    print("wrote to " + outname);
}
else {
    print("couldn't parse filename - not php/inc extension?");
    print("fname:" + fname);
    print("outname:" + outname);
}

print("done");
exit();
