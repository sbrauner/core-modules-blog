/**
 * context.js
 *
 * template related stuff for djang10
 *
 *  modeled after  django.template package
 */

function Context(dict) {
    this.dicts = [ dict || {} ];
}

Context.prototype.containsKey = function(key) {
    return this.dict.some(function(dict) { return key in dict; })
};

Context.prototype.get = function(key) {
    for(var dict in dicts)
        if(key in dict) 
            return dict[key];

    return null;
};

Context.prototype.put = function(key, value) {
    return this.dicts[0][key] = value;
};

Context.prototype.push = function() {
    var dict = {};
    this.dicts.unshift(dict);
    
    return dict;
};

Context.prototype.pop = function() {
    return this.dicts.shift();
};

