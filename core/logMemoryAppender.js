// logMemoryAppender.js


MemoryAppender = {};

MemoryAppender.create = function(){
    
    var cache = {};
    var options = { max : 100 };

    var append = function( loggerName , date , level , msg , throwable , thread ){
        
        var lst = cache[ loggerName ];
        if ( ! lst ){
            lst = new Array( javaCreate( "java.util.LinkedList" ) );
            cache[ loggerName ] = lst;
        }

        lst.push( { msg : msg , 
                    level : level ,  
                    date : date ,
                    throwable : throwable , 
                    thread : thread
            } );
        if ( lst.length > options.max  )
            lst.shift();

    };

    append.cache = cache;
    append.options = options;

    append.isMemoryAppender = true;
    
    return javaCreate( "ed.log.JSAppender" , append );
};


MemoryAppender.find = function( logger ){
    if ( ! logger )
        return null;
    
    if ( logger.appenders ){
        for ( var i=0; i<logger.appenders.length; i++ ){
            var a = logger.appenders[i];

            if ( isObject( a ) && a.isMemoryAppender )
                return a;
        }
    }
}
