// array utility methods

/* Warning: not a particularly fast distinct implementation! */
Array.prototype.distinct = function() { 
    for( var i = 0; i < this.length; i++ )
	for( var j = 1; j < this.length; j++ )
	    if( i!=j && this[i] == this[j] ) { 
		return false;
					     }
    return true;
}
