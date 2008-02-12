app.bugtracker.data.Project = function (name){
    this.name = name;
    this.areas = [];
};

db.bugtracker.projects.setConstructor(app.bugtracker.data.Project);
