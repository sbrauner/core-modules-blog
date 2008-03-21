core.ext.getlist();

Ext.pluck = function(path){
    path = path.split(/\./);
    return function(obj){
        return Ext.getlist.apply(this, [obj].concat(path));
    };
};

