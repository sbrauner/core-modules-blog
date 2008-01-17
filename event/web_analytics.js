/* webanalytics.js

   General form for an 'agg' is a mapping key -> val.

   Each agg is defined as a function which takes a pv (pageview) object, and returns a key and value-action.

   Actions:

    inc: { x: n }  increment var by n.  if no row yet, starts with 0+n.

   Typical aggs:

     page_view:        { hour, site, section } -> { n }
     visits:           { day,  site } -> { n } 
     visits:           { month,site } -> { n } 
     referer:          { hour, site, ref } -> { n } 
     referer_search:   { hour, site, ref } -> { n } 
     uniques:          { day, site } -> { n } 
     uniques:          { month, site } -> { n } 

   It is recommended that you sendReply() before performing analytics processing to save the user a couple milliseconds
   on their response times.

   Global variables:
     db should be set to the db of interest before the request.

 */

// database: increment the 'n' field of the record by one
function _incn(x) { x.n = (x.n||0) + 1; }

function PageView() { }


var Analytics = { 

    stdAggs = {
	
	page_view = function(pv) { return { key: { hour: pv.time.roundHour(), site: pv.site, section: pv.section }, op: incn }; }, 
	
	visitsDay = function(pv) { if( !pv.newVisit ) return null;
				   return { key: { day: pv.time.roundDay(), site: pv.site }, op: incn }; }, 
	
	visitsMonth = function(pv) { if( !pv.newVisit ) return null;
				     return { key: { month: pv.time.roundMonth(), site: pv.site }, op: incn }; }, 
	
	referer = function(pv) { if( !pv.referer ) return null;
				 return { key: { hour: pv.time.roundHour(), site: pv.site, ref: pv.referer }, op: incn }; }, 
	
	refererSearch = function(pv) { if( !pv.refererQuery ) return null;
				       return { key: { hour: pv.time.roundHour(), site: pv.site, ref: pv.refererQuery }, op: incn }; }, 
	
	uniquesDay = function(pv) { if( pv.userTimeLast ) return null;
				    return { key: { day: pv.time.roundDay(), site: pv.site }, op: incn }; }, 
	
	uniquesMonth = function(pv) { if( pv.userTimeLast ) return null;
				      return { key: { day: pv.time.roundMonth(), site: pv.site }, op: incn }; }, 

    },

    /* get the appropriate ns for the given aggregation. 
       returns: DBCollection object.
    */
    _nsName = function(key) { 
	var nm = ""; var first = true;
	for( var x in key ) {
	    if( !first ) nm += '_';
	    nm += x;
	    first = false;
	}
    },

    /* make sure we have an index on 'key' for each agg.
       pv is a prototype object that returns non-null for each stdAggs function so we can get a sample key.
     */
    ensureIndexes = function(aggs, pv) { 
    }

    /* account for the desired aggregations in the database.
       aggs: aggregations to run.  try Analytics.stdAggs for example.
       pv: the pageview object context
    */
    aggregate = function(aggs, pv) { 
	for( var x in aggs ) { 
	    var result = aggs[x](pv);
	    if( result )
		db.aggs[_nsName(x)].update(result.key, result.op);
	}
    }

};
