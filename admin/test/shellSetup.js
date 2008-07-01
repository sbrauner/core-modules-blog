db = connect("admin");

core.user.user();
user = db.users.findOne();

core.modules.blog.urls();
blog = core.modules.blog.install();
routes = new Routes();
routes.blog = blog.getRoutes();

