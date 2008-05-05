/* string utilities

 */

String.prototype.startsWithLC = function(s) { 
    var start = this.substring(0, s.length).toLowerCase();
    return start == s;
}

String.prototype.lessSuffix = function(s) { 
    if( this.endsWith(s) )
	return this.substring(0, this.length - s.length);
    return this;
}

String.prototype.lessPrefix = function(s) { 
    if( this.startsWith(s) )
	return this.substring(s.length);
    return this;
}

String.prototype.forEach = function(f) { 
    for( var i = 0; i < this.length; i++ )
	f(this[i]);
}

String.prototype.rtrim = function() { 
    var i = this.length-1;
    var j = i;
    while( i >= 0 && this[i] == ' ' ) i--;
    if( i == j ) return this;
    return this.substring(0, i+1);
}

// returns # of times ch occurs in the string
String.prototype.nOccurrences = function(ch) { 
    var n = 0;
    for( var i = 0; i < this.length; i++ )
	if( this[i] == ch ) n++;
    return n;
}

String.prototype.insert = function(at, str) {
    return this.substring(0, at) + str + this.substring(at);
}
