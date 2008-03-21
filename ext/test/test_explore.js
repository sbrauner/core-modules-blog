core.ext.explore();

// Basic use: map the object and multiply each target with a number.

o = {a : 1,
     b : 5,
     c : 13};

spec = {a: 4,
        b: -1,
        c: 1};


endfunc = function(num, fieldname, spec, options, parent){
    return spec*num;
};

result = Ext.explore(o, spec, endfunc);
assert(result.a == 4);
assert(result.b == -5);
assert(result.c == 13);

// Assert that arrays work, plus that fields are omitted.

o = {a: [1, 2, 3],
     b: 2,
     c: 3};
spec = {a: 4,
        c: -2};

result = Ext.explore(o, spec, endfunc);
assert(result.a.length == 3);
assert(result.a[0] == 4);
assert(result.a[1] == 8);
assert(result.a[2] == 12);
assert(result.c == -6);
assert(!("b" in result));

// Check that the parent field is set correctly.

o = {a: {b: {c: {d: 5}}}};

spec = {a: {b: {c: {d: 1}}}};

var gparent;
endfunc = function(num, fieldname, spec, options, parent){
    gparent = parent;
};

result = Ext.explore(o, spec, endfunc);

assert(gparent == o.a.b.c);

// Check that options are explored correctly.

options = {a: {b: {c: {d: {opt1: 4}}}}};

endfunc = function(num, fieldname, spec, options, parent){
    return num * options.opt1;
};

result = Ext.explore(o, spec, endfunc, options);

assert(result.a.b.c.d == 20);

// Check that options are inherited from parent objects, when appropriate.

options = {a: {b: {opt1: 4}}};

result = Ext.explore(o, spec, endfunc, options);

assert(result.a.b.c.d == 20);

// Using a function to pull a random field out.

spec = {a: {b: function(b){ return b.c.d + 1; }}};

result = Ext.explore(o, spec, endfunc, options);

assert(result.a.b == 6);

// Making up fields.

spec = {a: {foo: function(obj, fieldname, spec, options, parent){ return parent.b.c.d+2; }}};

result = Ext.explore(o, spec, endfunc, options);
assert(result.a.foo == 7);

