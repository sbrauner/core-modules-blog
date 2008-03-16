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

