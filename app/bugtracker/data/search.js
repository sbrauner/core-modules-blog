app.bugtracker.data.Search = function(u, args, name){
    this.user = u;
    this.args = args;
    this.name = name;
};

db.bugtracker.searches.setConstructor(app.bugtracker.data.Search);
