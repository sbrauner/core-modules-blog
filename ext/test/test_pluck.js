core.ext.pluck();

var f = Ext.pluck("name");

var o = {name: "Name", email: "Email"};

assert(f(o) == "Name");

var o2 = {name: "Name2", email: "email@noob.com"};

assert(f(o2) == "Name2");

var f2 = Ext.pluck("project.owner.email");

var b1 = {title: "This is a bug", project: {name: "core", owner: {name: "Ethan", email: "ethan@10gen.com"}}};

assert(f2(b1) == "ethan@10gen.com");

