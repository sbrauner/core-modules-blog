
Rails.requestFix = function( request , theRoute ){
    
    request.request_uri = request.getURI();
    request.host_with_port = request.getHeader( "Host" );
    
    request.path_parameters = theRoute;

    request.env = {
        REQUEST_PATH : request.getURL()
    };
    
    if ( request.getMethod() == "POST" ){
        request[ Rails.mangleName( "post?" ) ] = true;
        request[ "post?" ] = true;
    }

    cookies = request.getCookies() || {}
    DOMAIN_NAME = "http://" + request.getHeader( "Host" ) + "/";
};

Rails.Params = function( request , matchingRoute ){
    
    Object.extend( this , matchingRoute );

    for ( var foo in request )
        this.__add( this , foo , request[foo] );
    
};

Rails.Params.prototype.include_q_ = function( name ){
    return name in this;
}

Rails.Params.prototype.__add = function( obj , name , value ){
    
    SYSOUT( "adding name \"" + name + "\"" );
    var r = /^(\w+)\[(.*)\]$/.exec( name );
    if ( r ){
        SYSOUT( "\t here " );
        var o = obj[r[1]];
        if ( ! o ){
            o = {};
            obj[r[1]] = o;
        }
        this.__add( o , r[2] , value );
        return;
    }    
    
    var r = /^(\w+)\(([1-5])i\)$/.exec( name );
    if ( r ){
        var d = obj[r[1]];
        if ( ! d ){
            d = new Date();
            obj[r[1]] = d;
        }
        
        value = parseNumber( value );

        switch ( parseNumber( r[2] ) ){
        case 1: d.setYear( value ); break;
        case 2: d.setMonth( value - 1 ); break;
        case 3: d.setDate( value ); break;
        case 4: d.setHours( value ); break;
        case 5: d.setMinutes( value ); break;
        default: throw "don't know what to do with [" + name + "]";
            
        }

        return;
    }
    
    obj[name] = value;

};


