


helper_method = function(){
    for ( var i=0; i<arguments.length; i++ ){
        SYSOUT( "helper_method got [" + arguments[i] + "] NOT SURE WHAT TO DO" );
    }
}


rescue_from = function(){
    SYSOUT( "rescue_from not implemented" );
}

pluralize =  function( num , s ){
    if ( isString( num ) )
        return num + "s";
    
    if ( num <= 1 )
        return num + " " + s;
    
    return num + " " + s + "s";
}
