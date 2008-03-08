Ext.getdefault = function(obj, key, def){
    if(obj == null) return def;
    if(key in obj) return obj[key];
    return def;
};
