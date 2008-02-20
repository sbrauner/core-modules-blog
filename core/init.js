
SERVER_HOSTNAME = javaStatic( "java.net.InetAddress" , "getLocalHost" ).getHostName();

function mapUrlToJxpFileCore( uri , request ){

    if ( ( 
	  uri.match( /^(\/|\/~~\/)admin\// ) 
	  || uri.match( /^\/admin/ )
	  )
	 && ! uri.match(/assets/))
        return "~~/admin/index.jxp";
    
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
    
};


core.core.logMemoryAppender(); 
if ( ! MemoryAppender.find( log ) )
    log.appenders.push( MemoryAppender.create() );
