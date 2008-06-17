
SERVER_HOSTNAME = javaStatic( "java.net.InetAddress" , "getLocalHost" ).getHostName();

function mapUrlToJxpFileCore( uri , request , response ){

    // webdav
    var ua = request.getHeader( "User-Agent" );
    if ( ua &&
         ( ua.match( /webdav/i )
           || ua.match( /BitKinex/ )
           || ua.match( /\bneon\b/ )
           || ua.match( /Microsoft Data Access Internet Publishing Provider DAV/ )
           || ua.match( /Microsoft Data Access Internet Publishing Provider Protocol Discovery/ )
           || ua.match(/WebDrive/)
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
    if ( ( uri.match( /^(\/|\/~~\/)admin\// )
           || uri.match( /^\/admin/ )
         ) ){
        if ( uri.match(/assets/) ){
            var idx = uri.indexOf( "/admin" );
            return "/~~/modules" + uri.substring( idx );
        }
        else {
            return "/~~/modules/admin/index.jxp";
        }
    }

    // these are special things which you can't override.
    if ( uri.match( /^\/~~\// ) ||
         uri.match( /^\/@@\// ) )
        return uri;

    if ( routes && routes.apply ){
        var res = routes.apply( uri , request , response );
        if ( res )
            return res;
    }

};


core.core.log();

if ( ! MemoryAppender.find( log ) ){
    log.appenders.push( MemoryAppender.create() );
}
if ( ! BasicDBAppender.find( log ) ){
    var dba = BasicDBAppender.create();
    if ( dba )
        log.appenders.push( dba );
}
