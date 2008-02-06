core.forum.post();
core.db.db();
Forum.Thread = function(){
    this.commentsEnabled = true;
    this.pinned = true;
    this.latestPost = null;
    this.count = 1;
    this.startPost = null;
    this.topic = null;
};

Forum.Thread.list = function(topic){
    return db.forum.threads.find({topic: topic}).sort({pinned: -1});
};

Forum.Thread.prototype.findFirstPost = function(){
    return this.startPost;
};

db.forum.threads.setConstructor(Forum.Thread);
