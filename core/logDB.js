// logDB.js

core.db.db();

BasicDBAppender = {};

BasicDBAppender.create = function(){

    createCollection( "_logs" , {size:1000000, capped:true} );

    var append = function( loggerName , date , level , msg , throwable , thread ){
        var obj = LogUtil.createObject( loggerName , date , level.toString() , msg , LogUtil.prettyStackTrace( throwable ) , thread.toString() );
        db._logs.save( obj );
    }

    append.isBasicDBAppender = true;

    return javaCreate( "ed.log.JSAppender" , append );
};

BasicDBAppender.find = function( logger ){
    if ( ! logger )
        return null;

    if ( ! logger.appenders )
        return null;

    for ( var i=0; i<logger.appenders.length; i++ ){
        var a = logger.appenders[i];

        if ( isObject( a ) && a.isBasicDBAppender )
            return a;
    }

    return null;
};
