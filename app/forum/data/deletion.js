core.app.forum.data.thread();

Forum.data.Deletion = function(post, location, user){
    this.post = post || new Forum.data.Thread.Reply();
    this.location = location;
    this.user = user;
};

Forum.data.DeletionList = function(thread, reason, dels){
    this.thread = thread;
    this.reason = reason;
    this.deletions = [];
    this.deletions._dbCons = Forum.data.Deletion;
    if(dels){
        for(var i in dels){
            this.deletions[i] = dels[i];
        }
    }
};

db.forum.deleted.setConstructor(Forum.data.DeletionList);
