/**
 *  Enhancement library for DB Collection objects
 *
 *  DB object is expected to be passed in - the collection prototypes will be enhanced
 *  
 * @fileOverview dbutil.js - 10gen Database Collection Augmentations
 * @name 10gen Database Collection API Augmentation
 */

 /**
  * Database collection utility API - adds functionality to standard native 10gen database connection
 *  @class 10gen Database Collection Utility API
 */
 var DBCollectionUtilityFunctions = function(){}

/* Run the specified database "command" object.
*/
DBCollectionUtilityFunctions.prototype._dbCommand = function( cmdObj ) {
    return this.getDB().$cmd.findOne(cmdObj);
}


/**
 *  <p>Delete all indexes on the specified collection.</p>
 * 
 *  <p>Note : alpha: space is not reclaimed</p>
 *
 * @return SOMETHING_FIXME
 */
DBCollectionUtilityFunctions.prototype.deleteIndexes = function() {
    var res = this._dbCommand( { deleteIndexes: this.getName(), index: "*" } );
    if( res && res.ok && res.ok == 1 ) {
        this.getDB().system.indexes.remove( { ns: this.getFullName() } );
		this.getDB().system.namespaces.remove( { name: RegExp(this.getFullName() + "[.][$].*") } );
    }
    
    this.resetIndexCache();
    
    return res;
}

/**
 * <p>Delete one index.</p>
 *
 * <p>
 * Name is the name of the index in the system.indexes name field. (Run db.system.indexes.find() to
 *  see example data.)
 * </p>
 *
 * <p>Note :  alpha: space is not reclaimed </p>
 * @param {String} name of index to delete.
 * @return SOMETHING_FIXME
 */
 DBCollectionUtilityFunctions.prototype.deleteIndex =  function(index) {
    assert(index);
    
    if ( ! isString( index ) && isObject( index ) )
    	index = this.genIndexName( index );
    
    var res = this._dbCommand( { deleteIndexes: this.getName(), index: index } );
    if( res && res.ok && res.ok == 1 ) {
        this.getDB().system.indexes.remove( { ns: this.getFullName(), name: index } );
		this.getDB().system.namespaces.remove( { name: this.getFullName() + ".$"+index } );
    }
    
    this.resetIndexCache();
    
    return res;
}
 
/** 
 * Validate the data in a collection, returning some stats.
 * @return SOMETHING_FIXME
 */
DBCollectionUtilityFunctions.prototype.validate = function() {
    return this._dbCommand( { validate: this.getName() } );
}

/** 
 * <p>drops all objects in the collection</p>
 * <p>Note :  alpha: space not reclaimed.</p>
 * 
 * @return SOMETHING_FIXME
 */
DBCollectionUtilityFunctions.prototype.drop = function()
{
    var res = this._dbCommand( { drop: this.getName() } );
    if( res && res.ok && res.ok == 1 ) {
        this.getDB().system.indexes.remove( { ns: this.getFullName() } );
		this.getDB().system.namespaces.remove( { name: this.getFullName() } );
		this.getDB().system.namespaces.remove( { name: RegExp(this.getFullName() + "[.][$].*") } );
    }
    return res;
}

/**
 *  Drop free lists. Normally not used.
 */
DBCollectionUtilityFunctions.prototype.clean = function() {
    return this._dbCommand( { clean: this.getName() } );
}


/**
 *  Utility to associate a class with a table
 */
DBCollectionUtilityFunctions.prototype.associate = function(cls) {
	cls.find = this.find;
	cls.findOne = this.findOne;
	cls.save = this.save;
	cls.remove = this.remove;
	cls.prototype.save = function(){ this.save(this); };
}


/**
 *  <p>
 *  count # of objects in a collection
 * </p>
 *
 *  <p>  You can specify a filter for counting through the optional  parameter.
 *      This parameter specifies condition that must be true for the objects to
 *        be counted.  
 *  </p>
 *  <p>Example:</p>
 * 
 *   <code>c = count({active:true});</code>
 * 
 * @param {Object} query Optional query to use to filter objects for counting
 * @return number of objects in the collection that optionally match the filter condition
 */
DBCollectionUtilityFunctions.prototype.count = function(query) {
	
	var countFunction = function() { 
		return db[args[0]].find(args[1]||{}, {_id:ObjId()}).length();
	}
   return this.getDB().dbEval(countFunction, this.getName(), query);
}


//  TODO - ADD GROUP?

var mydb  = arguments[0];

if (!mydb) {
	throw "Error : no db object passed to augmentor for Collection";
}

Object.extend( mydb.getCollectionPrototype() , DBCollectionUtilityFunctions.prototype );

return null;



