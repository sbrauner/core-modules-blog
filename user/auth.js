/* Auth several different styles of authentication. */

core.user.user();

Auth = {

    debug : false ,

    getUser : function( req , res , uWanted ){

        if ( user )
            return user;

        var u = Auth.digest.getUser( req || request , res || response , db.getName() , uWanted );
        if ( ! u )
            u = Auth.cookie.getUser( req || request , res || response , db.getName() , uWanted );

        if ( ! u )
            return null;

        log.user.auth.info( "got user : " + u.name );
        return u;
    } ,

    reject : function( req , res ){
        return Auth.digest.reject( req || request , res || response , db.getName() );
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

        /**
         * @param user optional (default to finding based on name)
         */
        getUser : function( req , res , name , user ){
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

            if( ! user )
                user = User.find( things.username );
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
    } ,

    /* cookie-style user authentication */
    cookie :  {
        getUser : function( request , response , name ){
            var now = new Date();

            var username = request.getCookie( "username" );
            var myHash = request.getCookie( "userhash" );

            if ( username && myHash ){

                log.user.auth.cookie.debug( "got old username and hash " + username + " , " + myHash );

                var u = User.find( username );
                if ( u && u.tokens ){
                    log.user.auth.cookie.debug( "\t found user" );

                    var found = false;
                    u.tokens.forEach( function(z){
                            log.user.auth.cookie.debug( "\t\t got old : "  + tojson( z ) );
                            if ( z.hash != myHash )
                                return;
                            log.user.auth.cookie.debug( "\t\t\t hash match!" );

                            if ( expires < now ){
                                log.user.auth.cookie.debug( "\t\t\t too old" );
                                return;
                            }

                            found = true;
                        } );

                    if ( found )
                        return u;
                }

            }

            // check for login
            if ( ! request.username )
                return null;

            var prefix = request.prefix;
            var hash = request.hash;

            if ( ! ( prefix && hash ) )
                return null;

            var prefixOk = false;
            if ( prefix == md5( SERVER_HOSTNAME + ( new Date() ).roundMinutes( 7 ) ) ) prefixOk = true;
            if ( prefix == md5( SERVER_HOSTNAME + ( new Date( (new Date()).getTime() - ( 7 * 60 * 1000 )  ) ).roundMinutes( 7 ) ) ) prefixOk = true;
            if ( ! prefixOk )
                return null;

            log.user.auth.cookie.debug( "prefix ok.  username : " + request.username );

            var u = User.find( request.username );
            if ( ! u )
                return null;

            log.user.auth.cookie.debug( "got user : " + request.username  );
            var temp1 = md5( prefix + ":" + u.pass_ha1_name );
            var temp2 = md5( prefix + ":" + u.pass_ha1_email );
            if ( hash != temp1 && hash != temp2 ){
                log.user.auth.cookie.debug( " hashes don't match hash [" + hash + "] \n ha1n [" + u.pass_ha1_name + "] ha1e [" + u.pass_ha1_email + "] \n temp1[" + temp1 + "] temp2[" + temp2 + "]" );
                return null;
            }

            log.user.auth.cookie.debug( "yay - got valid user : " + request.getURL() );

            Auth.cookie.login( request , response , u );
            return u;
        } ,

        login : function( request , response , u ){
            var now = new Date();

            // gen token
            if ( ! u.tokens ){
                u.tokens = [];
            }
            else { // lets take this oppurunity to do some cleaning
                u.tokens = u.tokens.filter( function(z){
                        return z.expires > now;
                    } );
            }

            var myHash = md5( Math.random() );
            var remember = request.remember;

            var secs = 0;
            if ( remember )
                secs = 7 * 86400;

            var expires = null;
            if ( remember )
                expires = new Date( now.getTime() + ( secs * 1000 ) );
            else
                expires = new Date( now.getTime() + ( 86400 * 1000 ) );

            u.tokens.push( { hash : myHash , expires : expires } );
            db.users.save( u );

            response.addCookie( "username" , request.username , secs );
            response.addCookie( "userhash" , myHash , secs );

            return u;

        } ,

        reject : function ( req , res , name ){
            core.user.html.loginForce();
        }
    }

};

log.user.auth.level = log.LEVEL.ERROR;
