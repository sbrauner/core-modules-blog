
function mapUrlToJxpFileCore( uri , request ){
    var ua = request.getHeader( "User-Agent" );
	SYSOUT( "user agent : " + ua );
    if ( ua && ua.match( /webdav/i ) )
        return "/~~/webdav.jxp";
    
};
