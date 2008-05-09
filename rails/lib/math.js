
rand = function( i ){
    var r = Math.random();
    if ( i )
        return Math.floor( r * i );
    return r;
}
