core.forum.post();
core.db.db();
Forum.Thread = function(){
    this.commentsEnabled = true;
    this.pinned = true;
    this.latestPost = null;
    this.count = 1;
    this.startPost = null;
    this.forum = null;
};

Forum.Thread.list = function(forum){
//    return db.forum.posts.find({parent: null}).sort({pinned: -1});
    return db.forum.threads.find({forum: forum}).sort({pinned: -1});
};

Forum.Thread.prototype.findFirstPost = function(){
    //return db.forum.posts.findOne( { firstpost: true, parent: thread });
    return this.startPost;
};

db.forum.threads.setConstructor(Forum.Thread);
