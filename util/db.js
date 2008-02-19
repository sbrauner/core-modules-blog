has_index = function(ns, field){
    return db.system.indexes.findOne({ns: new RegExp(ns.name), name: new RegExp("^"+field)}) != null;
};
