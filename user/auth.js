
var Auth = {
    
    /**
       @return null or { user , pass }
     */
    getUserAndPass: function( req ){
        var auth = req.getHeader("Authorization");
        if ( ! auth )
            return null;
        
        if ( ! auth.match( /^Basic / ) )
            return null;
        
        
        auth = auth.substring( 6 );
        auth = Base64.decode( auth );
        var idx = auth.indexOf( ":" );

        if ( idx <= 0 )
            return null;
        
        return { user: auth.substring( 0 , idx ) , pass: auth.substring( idx + 1 ) };
    }  ,
     
    reject: function( res , name ){
        res.setHeader( "WWW-Authenticate" , "Basic realm=\"" + name + "\"" );
        res.setResponseCode( 401 );
        return "no";
    }
    
};
