core.ext.getdefault();

Ext.explore = function(obj, spec, endfunc, options){
    // Recursively explore an object according to spec.
    // When you get to a "simple" object *in the spec*, i.e. a string or
    // number, call:
    // endfunc(obj, fieldname, specfield, opts, parent).
    // spec is a mapping which tells for each field in the object what to do.
    // Accumulate the results of endfunc in a results object, which is then
    // returned.
    // An options argument can also be passed.
    options = options || {};
    return Ext.explore.helper(obj, spec, endfunc, options, null, obj);
};

Ext.explore.helper = function(obj, spec, endfunc, options, fieldname, parent){
    var results;
    var filter = Ext.getdefault(options, 'filter', function(){return true;});
    if(obj == null){
        log.ext.explore.debug("recursing onto a null object! Broken weights spec??");
    }
    else if(obj instanceof Array){
        results = [];
        for(var i = 0; i < obj.length; i++){
            if(! filter(i, obj[i])) continue;
            results.push(Ext.explore.helper(obj[i], spec, endfunc, options, fieldname, parent));
        }
    }
    else if(typeof spec == "number" || typeof spec == "string"){
        results = endfunc(obj, fieldname, spec, options, parent);
    }
    else {
        results = {};
        for(var field in spec){
            var s = spec[field];
            var opt = Ext.getdefault(options, field, options);
            var o = obj[field];

            if(typeof w == "number" || typeof w == "string" || typeof w == "boolean"){
                results[field] = endfunc(o, fieldname, spec, options, parent);
            }
            else if(w instanceof Function){
                results[field] = w(o, fieldname, spec, options, parent);
            }
            else {
                if(! filter(i, obj[i])) continue;
                results[field] = Ext.explore.helper(o, s, endfunc, opt, field, obj);
            }
        }
    }

    return results;
};