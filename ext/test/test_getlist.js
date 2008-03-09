core.ext.getlist();

o = {a : { b1 : 4, b2 : { c8: 1 } } };

assert(Ext.getlist(o, "a", "b1") == 4);
assert(Ext.getlist(o, "a", "b1", "b2") == null);
assert(Ext.getlist(o, "a", "b2", "c8") == 1);
assert(Ext.getlist(o, "a", "b2", "c1") == null);
assert(Ext.getlist(null, "a") == null);

