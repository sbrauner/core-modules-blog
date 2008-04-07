Ext.buffer = function(){
    var buf = "";
    var f = function(s){
        buf += s;
    };
    f.getBuffer = function() { return buf; }
    return f;
};
