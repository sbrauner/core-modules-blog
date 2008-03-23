core.ext.explore();

io.Marshal = function(obj, whitelist){
    var endfunc = function(obj, fieldname, specfield, opts, parent){
        if(typeof specfield == "string")
            return parent[specfield];
        return obj;
    };
    return Ext.explore(obj, whitelist, endfunc);
};

