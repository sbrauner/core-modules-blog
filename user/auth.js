
core.user.user();

var Auth = {

    debug : false ,
    
    getUser : function( req ){
        return Auth.digest.getUser( req , db.getName() );
    } ,

    reject : function( req , res ){
        return Auth.digest.reject( req , res , db.getName() );
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
        
        reject: function( req , res , name ){
            res.setHeader( "WWW-Authenticate" , "Basic realm=\"" + name + "\"" );
            res.setResponseCode( 401 );
	    res.getWriter().print( "not allowed" );
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
	    digestThings = things;            

            auth = auth.substring( 7 );
	    
	    var idx = auth.indexOf( "=" );
	    while ( idx > 0 ){
		var name = auth.substring( 0 , idx ).trim();
		var val = null;

		auth = auth.substring( idx + 1 ).trim();
		if ( auth.startsWith( "\"" ) ){
		    auth = auth.substring(1);
		    idx = auth.indexOf( "\"" );
		    val = auth.substring( 0 , idx );
		    auth = auth.substring( idx + 1 ).trim();
		}
		else {
		    var spaceidx = auth.indexOf( " " );
		    var commaidx = auth.indexOf( "," );
		    
		    if ( spaceidx < 0 && commaidx < 0 )
			idx = auth.length;
		    else if ( spaceidx < 0 )
			idx = commaidx;
		    else if ( commaidx < 0 )
			idx = spaceidx;
		    else
			idx = Math.min( commaidx , spaceidx );
		    
		    val = auth.substring( 0 , idx );
		    if ( val.endsWith( "," ) )
			val = val.substring( 0 , val.length - 1 );
		    auth = auth.substring( idx + 1 ).trim();
		}

		things[name] = val;
		if ( auth.startsWith( "," ) )
		    auth = auth.substring( 1 ).trim();
		idx = auth.indexOf( "=" );
	    }

            if ( ! things.username )
                return null;
            
            var uri = things.uri;
	    if ( ! uri )
		uri = req.getURI();
            
            var user = User.find( things.username );
            if ( ! user ){
                if ( Auth.debug ) SYSOUT( "no user:" + things.username );
                return null;
            }
            if ( Auth.debug ) SYSOUT( "found user:" + things.username );

            var ha1 = things.username.match( /@/ ) ? user.pass_ha1_email : user.pass_ha1_name;
            var ha2 = md5( req.getMethod() + ":" + uri );

            var r = md5( ha1 + 
                         ":" + things.nonce + 
                         ":" + things.nc + 
                         ":" + things.cnonce + 
                         ":" + things.qop + 
                         ":" + ha2 );
            
            if ( Auth.debug ) SYSOUT( r + "\n" + things.response );
            if ( r != things.response ){
                if ( Auth.debug ) SYSOUT( "don't match" );
                return null;
            }

            if ( Auth.debug ) SYSOUT( "success!" );
            
            return user;
        } , 
        
        reject : function( req , res , name ){
	    var realm = name;
	     
	    if ( req != null && "11" == req.getCookie( "__sudo" ) )
		realm = "admin";	

            res.setHeader( "WWW-Authenticate" , 
                           "Digest realm=\"" + realm + "\"," +
                           " nonce=\"" + md5( Math.random() ) + "\", " +
                           "algorithm=MD5, qop=\"auth\"" );
            res.setResponseCode( 401 );
            return "no";
        } 
    }
    
};

