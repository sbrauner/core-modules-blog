db = connect("test");

core.user.user();

db.users.remove({});

u1 = new User();

u1.name = "Test User";
u1.email = "test@10gen.com";
u1.setPassword("test");

u1.nickname = "Testy";

db.users.save(u1);

assert(User.find("Test User") != null);


// duplicate user testing

u2 = Object.extend({}, u1); // shallow copy of u1

delete u2._save; // u2 is like u1, but not in the database!
delete u2._update;
delete u2._ns;
delete u2._id;

db.users.save(u2);

var exception = null;
try {
    User.find("Test User");
}
catch(e){
    exception = e;
}

assert(exception);

exception = null;

try {
    User.find("test@10gen.com");
}
catch(e){
    exception = e;
}

assert(exception);
