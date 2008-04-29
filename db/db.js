// db.js - database helper functions

/* greater than, less than qualifiers.

   example:
     db.coll.find( { name: gt("m") } );

   gte = greater than or equal (>=)
   lte = less than or equal
*/
function gt( x ){
    return { $gt : x };
}
function lt( x ){
    return { $lt : x };
}

function gte( x ){
    return { $gte : x };
}
function lte( x ){
    return { $lte : x };
}

/* Run the specified database "command" object.
*/
function _dbCommand( cmdObj ) {
    return db.$cmd.findOne(cmdObj);
}

/* Create a new collection in the database.  Normally, collection creation is automatic.  You would
   use this function if you wish to specify special options on creation.

   If the collection already exists, no action occurs.

   Options:
     size: desired initial extent size for the collection.  Must be <= 1000000000.
           for fixed size (capped) collections, this size is the total/max size of the 
           collection.
     capped: if true, this is a capped collection (where old data rolls out).
     max: maximum number of objects if capped (optional).

   Example:
     createCollection("movies", { size: 10 * 1024 * 1024, capped:true } );
*/
function createCollection(name, options) {
    var cmd = { create: name, capped: options.capped, size: options.size, max: options.max };
    var res = _dbCommand(cmd);
    return res;
}

/* Delete all indexes on the specified collection.
   alpha: space is not reclaimed
 */
function deleteIndexes( collection ) {
    var res = _dbCommand( { deleteIndexes: collection, index: "*" } );
    if( res && res.ok && res.ok == 1 ) {
        db.system.indexes.remove( { ns: ""+db+"."+collection } );
	db.system.namespaces.remove( { name: RegExp(""+db+"."+collection+"[.][$].*") } );
    }
    return res;
}

/* Delete one index.

   Name is the name of the index in the system.indexes name field. (Run db.system.indexes.find() to
   see example data.)

   alpha: space is not reclaimed
 */
function deleteIndex( collection, index ) {
    assert(index);
    var res = _dbCommand( { deleteIndexes: collection, index: index } );
    if( res && res.ok && res.ok == 1 ) {
        db.system.indexes.remove( { ns: ""+db+"."+collection, name: index } );
	db.system.namespaces.remove( { name: ""+db+"."+collection+".$"+index } );
    }
    return res;
}

/* Validate the data in a collection, returning some stats.
 */
function validate( collection ) {
    return _dbCommand( { validate: collection } );
}

/* returns null if an error contacting db */
function getDbProfilingLevel() { 
    var res = _dbCommand( { profile: -1 } );
    return res ? res.was : null;
}

/* Set profiling level for your db.  Profiling gathers stats on query performance.
   Default is off, and resets to off on a database restart -- so if you want it on,
   turn it on periodically.
     0=off
     1=log very slow (>100ms) operations
     2=log all
*/
function setDbProfilingLevel(p) {
    if( p ) {
	// if already exists does nothing
	createCollection("system.profile", { capped: true, size: 128 * 1024 } );
    }
    return _dbCommand( { profile: p } );
}

/* drops all rows.  alpha: space not reclaimed.
   "collection" is a string
 */
function drop( collection )
{
    var res = _dbCommand( { drop: collection } );
    if( res && res.ok && res.ok == 1 ) {
        db.system.indexes.remove( { ns: ""+db+"."+collection } );
	db.system.namespaces.remove( { name: ""+db+"."+collection } );
	db.system.namespaces.remove( { name: RegExp(""+db+"."+collection+"[.][$].*") } );
    }
    return res;
}

/* Drop free lists. Normally not used. */
function clean( collection ) {
    return _dbCommand( { clean: collection } );
}

dbutil = {
    // associate a class with a table
    associate: function(cls, table){
        cls.find = table.find;
        cls.findOne = table.findOne;
        cls.save = table.save;
        cls.remove = table.remove;
        cls.prototype.save = function(){ table.save(this); };
    }
};

/* Evaluate a js expression at the database server.

   Useful if you need to touch a lot of data lightly; in such a scenario
   the network transfer of the data could be a bottleneck.  A good example
   is "select count(*)" -- can be done server side via this mechanism.

   Use _dbEval() if you would like a return code for the evaluation.  _dbEval returns
   { retval: functionReturnValue, ok: num [, errno: num] [, errmsg: str] }

   dbEval() simply returns the return value of the function that was invoked at the
   server.  If invocation fails (an exception occurs for example) null is returned.

   Example:
     print( "count(*): " + dbEval( function(){db.mycoll.find({},{_id:ObjId()}).length();} );
*/
function _dbEval(jsfunction) {
    var cmd = { $eval: jsfunction };
    if( arguments.length > 1 )
	cmd.args = arguments.slice(1);
    var res = _dbCommand( cmd );
    return res;
}
function dbEval(jsfunction) {
    var cmd = { $eval: jsfunction };
    if( arguments.length > 1 )
	cmd.args = arguments.slice(1);
    var res = _dbCommand( cmd );
    return res.retval;
}

_count = function() {
    return db[args[0]].find(args[1]||{}, {_id:ObjId()}).length();
}

/* count - count # of objects in a collection

   Second parameter is optional and specifies condition that must be true for the objects to
   be counted.  Example:

     c = count("videos", {active:true});
 */
function count(collection, query) {
    return dbEval(_count, collection, query);
}

// see group() below
_group = function() {
    var parms = args[0];
    var c = db[parms.ns].find(parms.cond||{});
    var map = new Map();

    while( c.hasNext() ) {
	var obj = c.next();

	var key = {};
	if( parms.key ) {
	    for( var i in parms.key )
		key[i] = obj[i];
	}
	else {
	    key = parms.$keyf(obj);
	}

	var aggObj = map[key];
	if( aggObj == null ) {
	    var newObj = Object.extend({}, key); // clone
	    aggObj = map[key] = Object.extend(newObj, parms.initial);
	}
	parms.$reduce(obj, aggObj);
    }

    var ret = map.values();
    return ret;
}

/* group()

   Similar to SQL group by.  For example:

     select a,b,sum(c) csum from coll where active=1 group by a,b

   corresponds to the following in 10gen:

     group(
       {
         ns: "coll",
         key: { a:true, b:true },
	 // keyf: ...,
	 cond: { active:1 },
	 reduce: { function(obj,prev) { prev.csum += obj.c; } },
	 initial: { csum: 0 }
	 });

   An array of grouped items is returned.  The array must fit in RAM, thus this function is not
   suitable when the return set is extremely large.

   To order the grouped data, simply sort it client side upon return.

   Defaults
     cond may be null if you want to run against all rows in the collection
     keyf is a function which takes an object and returns the desired key.  set either key or keyf (not both).
*/
function group(parmsObj) {
    var parms = Object.extend({}, parmsObj);
    if( parms.reduce ) {
	parms.$reduce = parms.reduce; // must have $ to pass to db
	delete parms.reduce;
    }
    if( parms.keyf ) {
	parms.$keyf = parms.keyf;
	delete parms.keyf;
    }
    return dbEval(_group, parms);
}
