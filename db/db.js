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

/* Delete all indexes on the specified collection.
   alpha: space is not reclaimed
 */
function deleteIndexes( collection ) {
    var res = _dbCommand( { deleteIndexes: collection } );
    if( res && res.ok && res.ok == 1 ) {
        db.system.indexes.remove( { ns: ""+db+"."+collection } );
    }
    return res;
}

/* Validate the data in a collection, returning some stats.
 */
function validate( collection ) {
    return _dbCommand( { validate: collection } );
}

/* drops all rows.  alpha: space not reclaimed.
 */
function drop( collection )
{
    var res = _dbCommand( { drop: collection } );
    if( res && res.ok && res.ok == 1 ) {
        db.system.indexes.remove( { ns: ""+db+"."+collection } );
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

