// array utility methods

/* true if elements distinct.
   Warning: not a particularly fast distinct implementation! 
*/
Array.prototype.distinct = function() { 
    for( var i = 0; i < this.length; i++ )
	for( var j = 1; j < this.length; j++ )
	    if( i!=j && this[i] == this[j] ) { 
		return false;
					     }
    return true;
}

Array.prototype.car = function() { return this[0]; }
Array.prototype.cdr = function() { return this.slice(1); }

/* like PHP implode (combine into a string) 
   removed: use Array.join() instead.
Array.prototype.implode = function(sep) { 
    var arr = this;
    if( !arr || arr.length == 0 ) return "";
    sep = sep || "";
    var s = arr[0];
    for( var i = 1; i < arr.length; i++ ) { 
	s += sep + arr[i];
    }
    return s;
}
*/
