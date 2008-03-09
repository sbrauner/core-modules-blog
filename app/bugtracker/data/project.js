app.bugtracker.data.Project = function (name){
    this.name = name;
    this.areas = [];
    this.owner = null;
};

db.bugtracker.projects.setConstructor(app.bugtracker.data.Project);
