core.db.db();
Forum.data.Thread = function(){
    this.commentsEnabled = true;
    this.pinned = true;
    this.latestPost = null;
    this.count = 1;
    this.startPost = null;
    this.topic = null;
};

Forum.data.Thread.prototype.findFirstPost = function(){
    return this.getReplies()[0];
};

core.threaded.data.reply_parent();
threaded.repliesEnabled(Forum.data, "Thread", {users: "free", tablename: "forum.posts"});

Forum.data.Thread.list = function(topic){
    return db.forum.threads.find({topic: topic}).sort({pinned: -1});
};

db.forum.threads.setConstructor(Forum.data.Thread);
