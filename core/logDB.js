// logDB.js

core.db.db();

BasicDBAppender = {};

BasicDBAppender.create = function(){
    
    createCollection( "_logs" , {size:1000000, capped:true} );

    var append = function( loggerName , date , level , msg , throwable , thread ){
        var obj = LogUtil.createObject( loggerName , date , level , msg , throwable , thread );
        db._logs.save( objg );
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
