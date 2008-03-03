core.app.forum.data.thread();

app.Forum.data.Deletion = function(post, location, user){
    this.post = post || new app.Forum.data.Thread.Reply();
    this.location = location;
    this.user = user;
};

app.Forum.data.DeletionList = function(thread, reason, dels){
    this.thread = thread;
    this.reason = reason;
    this.deletions = [];
    this.deletions._dbCons = app.Forum.data.Deletion;
    if(dels){
        for(var i in dels){
            this.deletions[i] = dels[i];
        }
    }
};

db.forum.deleted.setConstructor(app.Forum.data.DeletionList);
