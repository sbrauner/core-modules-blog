/* php.js
   php support definitions.
   include in _init.js
*/

core.util.string();
core.util.array();
core.php.apc();
core.php.memcache();

/* todo: */
function ini_set(a,b) { }
function ini_get(a,b) { }
function file_exists(fn) { return false; }

/* header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
   todo: support replace
*/
function header(h, replace, rc) { 
    var pieces = h.split(': ', 2);
    assert( pieces.length == 2 );
    response.setHeader(pieces[0], pieces[1]);
    if( rc ) 
	response.setResponseCode(rc);
}

function defined(x) { return x; }
function function_exists(x) { return x; }
function isset() { 
    for( var i = 0; i < arguments.length; i++ )
	if( !arguments[i] ) return false;
    return true;
}

function echo() { 
    arguments.forEach( print );
}

function error_reporting() { return 0; }

function array_slice(a, ofs, len) { 
    return a.slice(ofs,len);
}

function strpos(a,b) { 
    return a.indexOf(b);
}
function sizeof(a) { return a.length; }
function count(a) { return a.length; }

function implode(sep, arr) { return arr.implode(sep); }

function explode(sep, string, limit) { 
    if( !limit ) return string.split(sep);

    var arr = [];
    for( var z = 1; z < limit; z++ ) {
	var i = string.indexOf(sep);
	if( i < 0 )
	    break;
	arr.push(string.substring(0, i));
	string = string.substring(i+sep.length);
    }
    if( string.length ) 
	arr.push(string);
    return arr;
}

// e.g.
//   &quot; -> '"' 
function html_entity_decode(string, style, encoding) { 
    print("not done 1");
    return string;
}

function setlocale() { return false; }

function date() { return Date(); }
function gmdate() { return Date(); }

function time() { 
    return (new Date()).getTime() / 1000;
}

RAND_MAX = 0x7fffffff;
function rand() { 
    return (Math.random() * RAND_MAX).toFixed();
}

PHP_OS = "10gen";

function in_array(val, arr) { 
    return arr.contains(val);
}

function function_exists(fstr) { 
    return isFunction( scope.eval(fstr) );
}

function substr(s, ofs, len) { 
    return s.substring(ofs, len);
}

function strtolower(s) { return s.toLowerCase(); }

/* todo: not case insensitive, fix! */
function str_ireplace(a,b,c) { 
    return c.replace(a,b);
}

/* $_GET */
function _get() { return request; }

/* equiv of $_SERVER */
function _server() { 
    if( !__server ) { 
	__server = { 
	    HTTP_HOST: request.getHeader("Host"),
	    QUERY_STRING: request.getURI(),
	    HTTP_REFERER: request.getHeader("Referer"),
	    HTTP_USER_AGENT: request.getHeader("User-Agent"),
	    REMOTE_ADDR: request.getRemoteIP(),
	    //temp:
	    CONFIGPATH: "/data/sites/php/version2/configs/"
	};
    }
    return __server;
}

/* require/include for php 
   must be fully qualified atm.
*/
function require(path, once, cd) { 
    // TEMP LINE:
        path = path.lessPrefix("null");

    print("<pre>");

    print("<hr><pre>require\n");
    print("   path:" + path + "\n");
    if( once )
	print("   once:" + once + "\n");
    print("     cd:" + cd + "\n");
    path = path.lessSuffix(".php").lessSuffix(".inc");
    if( cd && !path.startsWith('/') ) { 
	assert( cd.endsWith('/') );
	path = cd + path;
	print("newpath:" + path + "\n");
    }

    if( once ) { 
	if( _included == null ) _included = { };
	if( _included[path] ) return;
	_included[path] = true;
    }

    var x = jxp;
    var s = path.split('/');
    //print("  split:" + tojson(s) + "\n");
    var start = path.startsWith('/') ? 4 : 0; // skip /data/sites/<client>/ on fully qualified form
    //print("  start:" + start + "\n");
    for( var i = start; i < s.length; i++ ) {
	x = x[s[i]];
	if( !x ) {
	    print("<p>require(): can't find ");
	    for( var j = start; j < s.length; j++ ) { 
		if( j > start ) print(".");
		if( j == i ) print("<u>");
		print(s[j]);
		if( j == i ) print("</u>");
	    }
	    print(".jxp\n<p>");
	}
    }
    x();
    print("OK");
}

function dirname(path) { 
    var i = path.lastIndexOf('/');
    return i < 0 ? path : path.substring(0, i);
}

// todo, other casts
// castint()
// castfloat()
// ...
function castarray(a) { return isArray(a) ? a : [a]; }

/* php foreach equivalent 
   foreachkv for $k => $v case
*/
function foreach(coll, f) { 
    try {
	coll.forEach(f); 
    }
    catch( e if e == "break" ) { }
}
function foreachkv(coll, f) { 
    try { 
	coll.forEach(function(k) 
		 { 
		     f(k, coll[k]);
		 });
    } catch( e if e == "break" ) { }
}
function breakForEach() { throw "break"; }
