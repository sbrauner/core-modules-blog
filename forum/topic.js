core.forum.post();
core.db.db();
Forum.Topic = function(){
    this.commentsEnabled = true;
    this.pinned = true;
};

Forum.Topic.list = function(){
    return db.forum.posts.find({parent: null}).sort({pinned: -1});
};
