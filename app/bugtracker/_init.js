app.bugtracker = Object();

core.app.bugtracker.bugtracker();
core.app.bugtracker.data.feature();

app.bugtracker._get_user_list = function (name){
    alist = app.App.getlist(allowModule, "bugs", name);
    return alist;
};

app.bugtracker.list_products = function(){
    return app.bugtracker._get_user_list("product");
};

app.bugtracker.list_OSes = function(){
    return app.bugtracker._get_user_list("OS");
};

app.bugtracker.list_versions = function(){
    return app.bugtracker._get_user_list("version");
};

