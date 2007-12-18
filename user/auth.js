
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
    } ,
    
    rejectDigest : function( res , name ){
        res.setHeader( "WWW-Authenticate" , 
                       "Digest realm=\"" + name + "\"," +
                       " nonce=\"" + md5( Math.random() ) + "\", " +
                       "algorithm=MD5, qop=\"auth\"" );
        res.setResponseCode( 401 );
        return "no";
    } ,

    getUserDigest : function( req , name ){
        var auth = req.getHeader("Authorization");
        if ( ! auth )
            return null;
        
        if ( ! auth.match( /^Digest / ) )
            return null;
        
        var things = {};
        
        auth = auth.substring( 7 );
        auth.split( /,/ ).forEach( function( z ){ 

                z = z.trim();
                var idx = z.indexOf( "=" );
                if ( idx < 0 )
                    return;
                var name = z.substring( 0 , idx );
                z = z.substring( idx + 1 ).trim();
                if ( z.startsWith( "\"" ) &&
                     z.endsWith( "\"" ) )
                    z = z.substring( 1 , z.length - 1 );
                
                things[name] = z;
            } );
        
        var ha1 = md5( things.username + ":" + name + ":17" );
        var ha2 = md5( req.getMethod() + ":" + req.getURI() );
        var r = md5( ha1 + 
                     ":" + things.nonce + 
                     ":" + things.nc + 
                     ":" + things.cnonce + 
                     ":" + things.qop + 
                     ":" + ha2 );

        if ( r != things.response )
            return null;
        
        return things.username;
    }
    
};

