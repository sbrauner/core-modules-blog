core.app.bugtracker.data.area();

app.bugtracker.data.Project = function (name){
    this.name = name;
    this.areas = [];
    this.areas._dbCons = app.bugtracker.data.Area;
    this.owner = null;
};

db.bugtracker.projects.setConstructor(app.bugtracker.data.Project);
