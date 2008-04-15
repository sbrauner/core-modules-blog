db = connect("test");

core.user.user();

db.users.remove({});

var assertException = function(f){
    exception = null;
    try {
        f();
    }
    catch(e){
        exception = e;
    }

    assert(exception);
};

u1 = new User();

u1.name = "Test User";
u1.email = "test@10gen.com";
u1.setPassword("test");

u1.nickname = "Testy";

db.users.save(u1);

assert(User.find("Test User") != null);




// duplicate user testing

u2 = Object.extend(new User(), u1); // shallow copy of u1

delete u2._save; // u2 is like u1, but not in the database!
delete u2._update;
delete u2._ns;
delete u2._id;

db.users.save(u2); // this save works because the uniqueness hash hasn't changed

assertException(function(){ User.find("Test User"); });

assertException(function(){ User.find("test@10gen.com"); });

// presave test

// 1. Try an object which is in the DB but without a uniqueness hash
delete u2.uniqueness_hash;

assertException(function(){ db.users.save(u2); });

// 2. An object which is not in the DB

db.users.remove(u2);
delete u2._id;

if(u2.uniqueness_hash) delete u2.uniqueness_hash;

assertException(function(){ db.users.save(u2); });
assert(u2._id == null);

u2.name = "Second User";

assertException(function(){ db.users.save(u2); });
assert(u2._id == null);

u2.name = "Test User";
u2.email = "not_duplicate@10gen.com";

assertException(function(){ db.users.save(u2); });
assert(u2._id == null);

// 3. An object which is in the DB whose username or email changed

u3 = new User();

u3.name = "Freddy User";
u3.email = "test3@10gen.com";
u3.nickname = "Fred";

db.users.save(u3);

u3.name = "Test User";
assertException(function(){ db.users.save(u3); });

u3.name = "Freddy User";
u3.email = "test@10gen.com";
assertException(function(){ db.users.save(u3); });



// 4. re-saving a unique object without a uniqueness hash (this shouldn't fail)

delete u1.uniqueness_hash;

try {
    db.users.save(u1);
    // shouldn't raise an exception
}
catch(e){
    assert(false);
}
