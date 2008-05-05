/* php.js
   php support definitions.
   include in _init.js
*/

core.util.string();

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

function isset() { 
    for( var i = 0; i < arguments.length; i++ )
	if( !arguments[i] ) return false;
    return true;
}

function echo() { 
    arguments.forEach( print );
}

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

/* equiv of $_SERVER */
function _server() { 
    if( !__server ) { 
	__server = { 
	    HTTP_HOST: request.getHeader("Host"),
	    QUERY_STRING: request.getURI(),
	    HTTP_REFERER: request.getHeader("Referer"),
	    HTTP_USER_AGENT: request.getHeader("User-Agent"),
	    REMOTE_ADDR: request.getRemoteIP()
	};
    }
    return __server;
}

/* require/include for php 
   must be fully qualified atm.
*/
function require(path) { 
    path = path.lessSuffix(".php").lessSuffix(".inc");
    var x = jxp;
    var s = path.split('/');
    print( "\n" + tojson(s) + "\n");
    for( var i = 4; i < s.length; i++ ) {
	print(s[i]);
	x = x[s[i]];
    }
    x();
}

function dirname(path) { 
    var i = path.lastIndexOf('/');
    return i < 0 ? path : path.substring(0, i);
}

function castarray(a) { return isArray(a) ? a : [a]; }
// todo, other casts
// castint()
// castfloat()
// ...

/* php foreach equivalent */
function foreach(coll, f) { 
    coll.forEach(f); 
}
function foreachkv(coll, f) { 
    coll.forEach(function(k) 
		 { 
		     f(k, coll[k]);
		 });
}
