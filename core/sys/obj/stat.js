
Stats = {};

Stats.mem = function( div ){
    div = div || 1;

    var r = javaStatic( "java.lang.Runtime" , "getRuntime" );
    
    var obj ={
	max : Math.floor( r.maxMemory() / div ) ,
	total : Math.floor( r.totalMemory() / div ) ,
	free : Math.floor( r.freeMemory() / div ) };
    
    obj.used = obj.total - obj.free;

    return obj;

};

Stats.threads = function(){
    var t = {};

    var all = javaStatic( "java.lang.Thread" , "getAllStackTraces" );
    
    var keySet = all.keySet();
    t.total = keySet.size();

    t.httpserver = {};
    t.httpserver.total = 0;
    t.httpserver.active = 0;
    
    for ( var i=keySet.iterator() ; i.hasNext(); ){
	var temp = i.next();

	if ( temp.getName().indexOf( "HttpServer:" ) >= 0 ){
	    t.httpserver.total++;
	    if ( temp.getState().toString().equals( "RUNNABLE" ) )
		t.httpserver.active++;
	}
    }


    return t;
};

Stats.all = function(){
    var stats = {}

    stats.mem = Stats.mem( 1024 * 1024 );
    stats.threads = Stats.threads();
    

    return stats;
}