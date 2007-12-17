
function mapUrlToJxpFileCore( uri , request ){
    var ua = request.getHeader( "User-Agent" );
    if ( ua && ua.match( /webdav/i ) )
        return "/~~/webdav.jxp";
    
};
