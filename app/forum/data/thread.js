core.db.db();
Forum.data.Thread = function(){
    this.commentsEnabled = true;
    // Whether a thread is "sticky", "pinned", or otherwise. Such threads
    // are "higher priority" and come first when listing the
    // threads in a topic.
    this.pinned = false;
    this.created = new Date();
    this.lastPostTime = new Date();
    this.latestPost = null;
    this.count = 1;
    this.topic = null;
};

Forum.data.Thread.prototype.findFirstPost = function(){
    return this.getReplies()[0];
};

Forum.data.Thread.prototype.getFirstPost = function() {
    return this.findFirstPost();
};

Forum.data.Thread.prototype.setTopic = function(newTopic) {
    oldTopic = this.topic;
    oldTopic.postCount -= this.count;
    oldTopic.threadCount--;

    newTopic.postCount += this.count;
    newTopic.threadCount++;

    this.topic = newTopic;
};

Forum.data.Thread.prototype.getLatestPost = function() {
    // Try to find a post to use for "last post in this thread by..."
    // functionality in html/thread or whatever.
    // Start by seeing if we have a descendant with the ID of
    // this.latestPost. This'll probably work,
    // unless that post was deleted, in which case we'll get a null.
    var p = this.getDescendant(this.latestPost);
    if(p) return p;

    // Oh well, let's start proceeding backwards through all replies.
    // We should always find something -- the first post in a thread always
    // exists, even if it's been deleted.
    var reps = this.getReplies();
    for(var i = reps.length - 1; i >= 0; i--){
        if(reps[i])
            return reps[i];
    }
    log.app.forum.error("couldn't find the last post for "+ this._id);
    return null;
}

// This adds children and the rendering thereof to the Thread class.
// For more on this, check corejs/threaded/_init.js.
// A bunch of functions are added to the Thread class -- getReplies(),
// decoratorsRender(), decoratorsHandle().
core.threaded.data.reply_children();
threaded.repliesEnabled(Forum.data, "Thread", {style: "children", users: "auth", tablename: "forum.posts", replyable: false});

Forum.data.Thread.list = function(topic){
    return db.forum.threads.find({topic: topic}).sort({pinned: -1, lastPostTime: -1});
};

db.forum.threads.setConstructor(Forum.data.Thread);

db.forum.threads.ensureIndex({created : -1});
db.forum.threads.ensureIndex({lastPostTime : -1});
db.forum.threads.ensureIndex({pinned: 1});
db.forum.threads.ensureIndex({pinned: 1, lastPostTime: 1});
core.db.db();
dbutil.associate(Forum.data.Thread, db.forum.threads);
