core.db.db();
Forum.data.Thread = function(){
    this.commentsEnabled = true;
    this.pinned = true;
    this.latestPost = null;
    this.count = 1;
    this.topic = null;
};

Forum.data.Thread.prototype.findFirstPost = function(){
    return this.getReplies()[0];
};

// This adds children and the rendering thereof to the Thread class.
// For more on this, check corejs/threaded/_init.js.
// A bunch of functions are added to the Thread class -- getReplies(),
// decoratorsRender(), decoratorsHandle().
core.threaded.data.reply_children();
threaded.repliesEnabled(Forum.data, "Thread", {style: "children", users: "auth", tablename: "forum.posts", replyable: false});

Forum.data.Thread.list = function(topic){
    return db.forum.threads.find({topic: topic}).sort({pinned: -1});
};

db.forum.threads.setConstructor(Forum.data.Thread);
