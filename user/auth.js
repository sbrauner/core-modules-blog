
if ( ! User ){
    core.user.user();
}

var Auth = {
    
    getUser : function( req ){
        return Auth.digest.getUser( req , db.getName() );
    } ,

    reject : function( res ){
        return Auth.digest.reject( res , db.getName() );
    } ,

    basic : { 
        getUser : function( req ){
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
            
            var name = auth.substring( 0 , idx );

            var user = User.find( name );
            if ( ! user )
                return null;
            
            var pass = auth.substring( idx + 1 );
            if ( ! user.checkPasswordClearText( pass ) )
                return null;
            
            return user;
        }  ,
        
        reject: function( res , name ){
            res.setHeader( "WWW-Authenticate" , "Basic realm=\"" + name + "\"" );
            res.setResponseCode( 401 );
            return "no";
        } 
    } ,
    
    digest : {

        getUser : function( req , name ){
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
            
            if ( ! things.username )
                return null;
            
            var uri = things.uri;
	    if ( ! uri )
		uri = req.getURI();
            
            var user = User.find( things.username );
            if ( ! user )
                return null;

            var ha1 = things.username.match( /@/ ) ? user.pass_ha1_email : user.pass_ha1_name;
            var ha2 = md5( req.getMethod() + ":" + uri );

            var r = md5( ha1 + 
                         ":" + things.nonce + 
                         ":" + things.nc + 
                         ":" + things.cnonce + 
                         ":" + things.qop + 
                         ":" + ha2 );
            
            if ( r != things.response )
                return null;
            
            return user;
        } , 
        
        reject : function( res , name ){
            res.setHeader( "WWW-Authenticate" , 
                           "Digest realm=\"" + name + "\"," +
                           " nonce=\"" + md5( Math.random() ) + "\", " +
                           "algorithm=MD5, qop=\"auth\"" );
            res.setResponseCode( 401 );
            return "no";
        } 
    }
    
};

