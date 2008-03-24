core.ext.explore();
core.io.encode.javascript();

io.Encode.JSON = function(obj){
    return io.Encode.JSON.helper(obj, 0);
};

io.Encode.JSON.string = function(s) {
    return '"' + io.Encode.JavaScript.escape(s) + '"'
};

io.Encode.JSON.helper = function(obj, indent){
    if(obj == null) return "null";
    if(typeof obj == "number"){
        return new String(obj);
    }
    if(typeof obj == "string"){
        return io.Encode.JSON.string(obj);
    }
    if(typeof obj == "boolean"){
        if(obj == true) return "true";
        return "false";
    }
    if(typeof obj == "native"){
        return io.Encode.JSON.string(obj.toString());
    }
    if(obj instanceof Array){
        var str = "[" + obj.map(function(o){ return io.Encode.indent(indent) + io.Encode.JSON.helper(o, indent+2); }).join(',\n' + io.Encode.indent(indent+1)) + "]";
        return str;
    }
    var fieldsary = [];
    for(var field in obj){
        fieldsary.push(io.Encode.JSON.string(field) + ": " + io.Encode.JSON.helper(obj[field], indent+2));
    }
    return "{" + fieldsary.join(",\n" + io.Encode.indent(indent+1)) + "}";
};
