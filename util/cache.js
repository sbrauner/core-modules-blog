
function TimeOutCache( cacheTime ){
    this.cache = {};
    this.cacheTime = time || ( 1000 * 60 );
};

TimeOutCache.prototype.add = function( name , value , cacheTime ){
    cacheTime = cacheTime || this.cacheTime;
    var t = new Date();
    t = new Date( t.getTime() + cacheTime );
    this.cache[ name ] = { value : value , dead : t };
};

TimeOutCache.prototype.get = function( name ){
    var v = this.cache[ name ];
    if ( ! v )
	return null;
    
    var now = new Date();
    if ( now.getTime() > v.dead.getTime() )
	return null;
    
    return v.value;
};