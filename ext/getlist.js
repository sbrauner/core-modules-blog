Ext.getlist = function(){
    var obj = arguments[0];
    var i = 1;
    while(obj && i < arguments.length){
        if(typeof obj == "number") return null;
        obj = obj[arguments[i]];
        ++i;
    }
    return obj;
};

