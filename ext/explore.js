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
        log.ext.explore.debug("recursing onto a null object! parent was " + tojson(parent) + " field was " + fieldname);
    }

    if(obj instanceof Array){
        results = [];
        var this_spec = spec;
        for(var i = 0; i < obj.length; i++){
            if(! filter(i, obj[i])) continue;
            if(spec instanceof Array) this_spec = spec[i];
            results.push(Ext.explore.helper(obj[i], this_spec, endfunc, options, fieldname, parent));
        }
    }
    else if(spec == null || typeof spec == "number" || typeof spec == "string" || typeof spec == "boolean" || typeof spec == "native"){
        results = endfunc(obj, fieldname, spec, options, parent);
    }
    else if(spec instanceof Function){
        results = spec(obj, fieldname, spec, options, parent);
    }
    else {
        results = {};
        for(var field in spec){
            var s = spec[field];
            var opt = Ext.getdefault(options, field, options);
            var o = obj[field];

            if(! filter(field, o)) continue;
            results[field] = Ext.explore.helper(o, s, endfunc, opt, field, obj);
        }
    }

    return results;
};

log.ext.explore.level = log.ext.explore.LEVEL.INFO;
