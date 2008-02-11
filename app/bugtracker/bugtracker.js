SYSOUT ("STARTING BUGTRACKER");
SYSOUT(app);
app.App = function() {}
app.App.prototype.config = function(key, opts){
        if(opts && opts.merge){
            var merge = app.App.getlist(allowModule, this.name, key);
            return merge.concat(db._config.find({app: this.name, key: key}).toArray());
        }
    else if(opts && opts.priority == "_init") {
            var val = app.getlist(allowModule, this.name, key);
            if(! val)
                val = db._config.findOne({app: this.name, key: key});
            return val;
        }
};

app.App.getlist = function(){
        //SYSOUT(getlist(app, "bugtracker", "data", "helper", "getlist") == app.bugtracker.data.helper.getlist);
        var obj = arguments[0];
        var i = 1;
        while(obj && i < arguments.length){
            obj = obj[arguments[i]];
            ++i;
        }
        return obj;
};

app.bugtracker.BugTracker = function() {};
app.bugtracker.BugTracker.prototype = new app.App();
app.bugtracker.BugTracker.prototype.name = "bugtracker";
app.bugtracker.app = app.bugtracker.BugTracker();