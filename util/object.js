// object utility methods

Object.prototype.clone = function() { 
    return Object.extend({}, this);
}
