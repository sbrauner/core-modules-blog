/**
 * context.js
 *
 * template related stuff for djang10
 *
 *  modeled after  django.template package
 */

function Context() {
    this.storage = {};
}

Context.prototype.get = function(key) {
    return this.storage[key];
}

Context.prototype.put = function(key, value) {
    return this.storage[key] = value;
}

Context.prototype.getRawStorageObject = function() {
    return this.storage;
}

