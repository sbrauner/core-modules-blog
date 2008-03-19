
SERVER_HOSTNAME = javaStatic( "java.net.InetAddress" , "getLocalHost" ).getHostName();

function mapUrlToJxpFileCore( uri , request ){
    
    // webdav
    var ua = request.getHeader( "User-Agent" );
    if ( ua && 
         ( ua.match( /webdav/i )
           || ua.match( /BitKinex/ )
           || ua.match( /Microsoft Data Access Internet Publishing Provider DAV/ )
           || ua.match( /Microsoft Data Access Internet Publishing Provider Protocol Discovery/ )
           )
         ){
        return "/~~/webdav.jxp";
    }
    
    if ( 
        uri.match( /.*~$/ ) 
        || uri.match( /\/\.#/ )
         )
        return "~~/bad";

    // admin
    if ( ( 
	  uri.match( /^(\/|\/~~\/)admin\// ) 
	  || uri.match( /^\/admin/ )
	  )
	 && ! uri.match(/assets/))
        return "~~/admin/index.jxp";

    // these are special things which you can't override.
    if ( uri.match( /^\/~~\// ) ||
	 uri.match( /^\/@@\// ) )
	return uri;

    if ( routes && routes.apply ){
        var res = routes.apply( uri , request );
        if ( res )
            return res;
    }
    
};


core.core.logMemoryAppender(); 
if ( ! MemoryAppender.find( log ) )
    log.appenders.push( MemoryAppender.create() );
