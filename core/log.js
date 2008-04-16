// log.js

LogUtil = {};

LogUtil.createObject = function( loggerName , date , level , msg , throwable , thread ){
    return { 
	msg : msg , 
        level : level ,  
        date : date ,
        throwable : throwable , 
        thread : thread ,
	logger : loggerName 
    };
    
};

core.core.logMemoryAppender(); 
core.core.logDB(); 
