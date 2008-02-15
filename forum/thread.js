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

Forum.Thread.prototype.findFirstPost = function(){
    return this.getReplies()[0];
};

core.threaded.data.reply_parent();
threaded.repliesEnabled(Forum, "Thread", {users: "free", tablename: "forum.posts"});

Forum.Thread.list = function(topic){
    return db.forum.threads.find({topic: topic}).sort({pinned: -1});
};

db.forum.threads.setConstructor(Forum.Thread);
