/* php.js
   php support definitions.
   include in _init.js
*/

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
