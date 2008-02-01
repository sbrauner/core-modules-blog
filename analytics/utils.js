//  utils.js

if ( ! Analytics )
    Analytics = {};

if ( ! Analytics._utilsInit ){

    Analytics.inc = { $inc : { num : 1 } };
    Analytics.dbOptions = { upsert : true , ids : false };
    
    Analytics.hour = function( r ){
        return r.getStart().roundHour();
    };
    Analytics.day = function( r ){
        return r.getStart().roundDay();
    };
    Analytics.month = function( r ){
        return r.getStart().roundMonth();
    };
    
    
    Analytics.hourlyThing = function( name ){
        var key = { time : Analytics.hour };
        key[name] = function( r ){ return r[name]; };
        
        return { key : key , 
                skip : function( r ){ return ! r[ name ] } 
        };
    };
    
    Analytics.stdAgs = {
        pageView : { key : { time : Analytics.hour } } ,
        
        title : Analytics.hourlyThing( "title" ) ,
        search : Analytics.hourlyThing( "search" ) ,
        referrer : Analytics.hourlyThing( "referrer" ) ,
        referrerSearch : Analytics.hourlyThing( "referrerSearch" ) ,
        section : Analytics.hourlyThing( "section" ) ,
      
	titleReferrer : {
	    key : { time : Analytics.hour , 
		    referrer : function( r ){ return r[ "referrer" ]; } ,
		    title : function( r ){ return r[ "title" ]; } 
	    } ,
	    skip : function ( r ){ 
		if ( ! r.referrer ) return true;  
		if ( ! r.title ) return true;  
		return false;
	    } 
	} ,
		    
        uniqueHour : { key : { time : Analytics.hour } , skip : function( r ){ return ! r.uniqueHour; } } ,
        uniqueDay : { key : { time : Analytics.day } , skip : function( r ){ return ! r.uniqueDay; } } ,
        uniqueMonth : { key : { time :  Analytics.month } , skip : function( r ){ return ! r.uniqueMonth; } }
        
    };
    
    Analytics.go = function( r , aggs ){
        for ( var name in aggs ){
            var x = aggs[name];
            if ( x.skip && x.skip( r ) )
                continue;
            
            var op = x.op || Analytics.inc;
            
            var key = {};
            for ( var foo in x.key ){
                var v = x.key[foo];
                if ( isFunction( v ) )
                    v = v(r);
                key[foo] = v;
            }
            
            var coll = db.analytics[ name ];
	    coll.ensureIndex( { time : 1 } );
            coll.update( key , op , Analytics.dbOptions );
        }
    };

    Analytics._utilsInit = true;

}

