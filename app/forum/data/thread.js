core.db.db();
core.content.search();
core.ext.getlist();
app.Forum.data.Thread = function(){
    this.commentsEnabled = true;
    // Whether a thread is "sticky", "pinned", or otherwise. Such threads
    // are "higher priority" and come first when listing the
    // threads in a topic.
    this.pinned = false;
    this.created = new Date();
    this.lastPostTime = new Date();
    this.closed = false;
    this.latestPost = null;
    this.count = 1;
    this.editorPick = false;
    // This could be a reference to a db.forum.topic, or an ObjectId:
    // app.Forum.Controller.specialDeletedID or
    // app.Forum.Controller.specialModeratedID
    this.topic = null;
};

app.Forum.data.Thread.prototype.SEARCH_OPTIONS = {
    title: 1,
    threaded_children: {
        // THREADED: this would have to change, of course, if we changed
        // reply styles
        title: .2,
        content: .2
    }
};

app.Forum.data.Thread.prototype.presave = function() {
    Search.index( this , this.SEARCH_OPTIONS );
};

app.Forum.data.Thread.prototype.getTitle = function() {
    return this.getFirstPost().title;
};

app.Forum.data.Thread.prototype.setTitle = function(title){
    this.getFirstPost().title = title;
};

app.Forum.data.Thread.prototype.setClosed = function(isClosed){
    this.commentsEnabled = !isClosed;
};

app.Forum.data.Thread.prototype.getClosed = function(isClosed){
    return !this.commentsEnabled;
};

app.Forum.data.Thread.prototype.getHidden = function(){
    return this.topic.getHidden();
};

app.Forum.data.Thread.prototype.getFirstPost = function(){
    return this.getReplies()[0];
};

app.Forum.data.Thread.prototype.setTopic = function(newTopic) {
    var oldTopic = this.topic;
    if(oldTopic != app.Forum.Controller.specialDeletedID &&
       oldTopic != app.Forum.Controller.specialModeratedID)
        oldTopic.subtThread(this.count);

    this.topic = newTopic;
    if(newTopic != app.Forum.Controller.specialDeletedID &&
       newTopic != app.Forum.Controller.specialModeratedID)
        newTopic.addThread(this.count);
};

app.Forum.data.Thread.prototype.getLatestPost = function() {
    // Try to find a post to use for "last post in this thread by..."
    // functionality in html/thread or whatever.
    // Start by seeing if we have a descendant with the ID of
    // this.latestPost. This'll probably work,
    // unless that post was deleted, in which case we'll get a null.
    if(! this.latestPost) return null;
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

app.Forum.data.Thread.prototype.modifyPostCount = function(num){
    this.count += num;
    this.topic.changeCounts(0, num);
    this.save();
};

// Posts have a deleted field; this field is either false, meaning
// this post isn't deleted, or it is one of:
// the string "deleted"
// the string "moderated"
app.Forum.data.Thread.prototype.removePost = function(reason, desc_id){
    var p = this.getDescendant(desc_id);
    p.deleted = reason;
    this.save();
    this.saveDescendant(p);
    this.modifyPostCount(-1);
};

app.Forum.data.Thread.prototype.addPost = function(reason, desc_id){
    var p = this.getDescendant(desc_id);
    if(p.deleted == reason){
        p.deleted = false;
        this.modifyPostCount(1);
        this.save();
        this.saveDescendant(p);
    }
};

app.Forum.data.Thread.prototype.recalculate = function() {
    var reps = this.getReplies();
    reps = reps.filter(function(r) { return ! r.deleted; });
    this.count = reps.length;
    this.save();
};

app.Forum.data.Thread.prototype.isExpired = function(){
    var days = Ext.getlist(allowModule, 'forum', 'threadExpirationDays');
    if(! days) return false;
    var end = new Date(this.created.getTime() + days * 24 * 60 * 60 * 1000 );
    return new Date() > end;
};

app.Forum.data.Thread.prototype.postable = function(){
    return ! this.closed && ! this.isExpired();
};

// This adds children and the rendering thereof to the Thread class.
// For more on this, check corejs/threaded/_init.js.
// A bunch of functions are added to the Thread class -- getReplies(),
// decoratorsRender(), decoratorsHandle().
core.threaded.data.reply_children();
threaded.repliesEnabled(app.Forum.data, "Thread",
                        {style: "children", users: "auth",
                         tablename: "forum.posts", replyable: false,
                         pieces: core.app.forum.html
                                                  });

app.Forum.data.Thread.list = function(topic){
    return db.forum.threads.find({topic: topic}).sort({pinned: -1, lastPostTime: -1});
};

db.forum.threads.setConstructor(app.Forum.data.Thread);

db.forum.threads.ensureIndex({created : -1});
db.forum.threads.ensureIndex({lastPostTime : -1});
db.forum.threads.ensureIndex({pinned: 1});
db.forum.threads.ensureIndex({pinned: 1, lastPostTime: 1});
core.db.db();
dbutil.associate(app.Forum.data.Thread, db.forum.threads);
Search.fixTable(db.forum.threads, app.Forum.data.Thread.prototype.SEARCH_OPTIONS);
