Object.instanceOf = function(object, constructor){

    while (object != null && (typeof object == "object")) {
        if (object == constructor.prototype) 
            return true;
        object = object.__proto__;
    }
    return false;
};

Object.isEmpty = function(object) {
    for(var p in object)
        return true;
        
    return false;  
};

Object.extend = function(parent, child) {
    child.prototype.__proto__ = parent.prototype;
};

Object.define = function(namespace, name, cons, proto) {
    if(namespace instanceof String)
        namespace = scope[namespace];

    cons.prototype = proto;
    scope.getParent()[name] = cons;
    scope[namespace] = cons;
};
