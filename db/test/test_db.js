db = connect("test");
core.db.db();

Class = function(){
    this.a = 4;
};

dbutil.associate(Class, db.table1);
Class.remove({});

c = new Class();
c.save();

assert(Class.find().length() == 1);
assert(Class.findOne({a: 4}) != null);

c.a = 6;
c.save();

assert(Class.find().length() == 1);
assert(Class.findOne().a == 6);

