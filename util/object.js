// object.js
// object utility functions

Object.prototype.clone = function() { 
    return Object.extend({}, this);
}
