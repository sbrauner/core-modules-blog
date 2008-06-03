/* Seeded random number generator */

var foo = {};

foo.getRandom = function(seed) {
    return javaCreate("java.util.Random", seed);
};

return foo;


