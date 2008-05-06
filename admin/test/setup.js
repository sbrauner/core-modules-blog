db = connect('admin'); // I guess this should be done by the framework?

core.user.user();
u = new User();
u.name = "Test User";
u.email = "test@10gen.com";
u.setPassword("test");
u.addPermission('admin');

db.users.save(u);

u2 = new User();
u2.name = "Not Admin";
u2.email = "notadmin@10gen.com";
u2.setPassword("notadmin");

db.users.save(u2);

