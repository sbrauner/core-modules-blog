core.ext.explore();

io.Marshal = function(obj, whitelist){
    var endfunc = function(obj, fieldname, specfield, opts, parent){
        if(typeof specfield == "string")
            return parent[specfield];
        return obj;
    };
    return Ext.explore(obj, whitelist, endfunc);
};

io.Marshal.TreeForm = function(opts){
    return function(ary){
        var ret = {};
        var valuefunc = isFunction(opts.value) ? opts.value : function(o){ return io.Marshal(o, opts.value); };
        for(var i = 0; i < ary.length; i++){
            ret[opts.key(ary[i])] = valuefunc(ary[i]);
        }
        return ret;
    };
};
