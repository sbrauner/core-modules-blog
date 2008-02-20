
has_index = function(ns, field){
    if ( ! ns )
	return false;
    
    var l = { ns : new RegExp( ns.name ) , name: new RegExp("^"+field) };
    
    return db.system.indexes.findOne( l ) != null;
};
