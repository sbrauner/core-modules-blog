
Forms = {
    fillInObject : function( prefix , o ){
	if ( ! o ) o = Object();

        for ( var name in request ){

            if ( prefix && ! name.startsWith( prefix ) )
                continue;
            
            if ( ! name )
                continue;

	    var val = request[name];
            if ( prefix )
                name = name.substring( prefix.length );

	    if ( ! val ) continue;
	    if ( val.lenth == 0 ) continue;

	    if ( name == "_id" ) val = CrID( val );
		
            o[name] = val;
        }
        return o;
    }
}
