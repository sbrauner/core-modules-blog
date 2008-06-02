db = connect("admin");

core.user.user();
user = db.users.findOne();

core.blog.urls();
blog = core.blog.install();
routes = new Routes();
routes.blog = blog.getRoutes();

