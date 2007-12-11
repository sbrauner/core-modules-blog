
Forms = {
    fillInObject : function( prefix ){
        var o = Object();
        for ( var name in request ){
            if ( prefix && ! name.startsWith( prefix ) )
                continue;
            o[name] = request[name];
        }
        return o;
    }
}
