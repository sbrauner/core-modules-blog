core.content.search();
core.app.forum.data.thread();

app.Forum.data.Topic = function(){
    this.name = "";
    this.description = "";
    this.hidden = false;
    this.allowPosts = true;
    this.order = 0;

    // Housekeeping fields
    this.latestPost = null;
    this.parent = null;
    this.postCount = 0;
    this.threadCount = 0;
    this.postCountJustThis = 0;
    this.threadCountJustThis = 0;
    this.clean = false;

};

app.Forum.data.Topic.prototype.getAncestors = function() {
    var i = 0;
    var topicStack = [];
    tempTopic = this;
    do {
        topicStack[i++] = tempTopic.name;
        tempTopic = tempTopic.parent;
    } while(tempTopic != null);
    return topicStack.reverse();
};

app.Forum.data.Topic.prototype.getThreadCount = function() {
    count = db.forum.threads.find( { topic : this } ).toArray.length;
    subtopics = db.forum.topic.find( { parent : this } );
    for(var i=0; i < subtopics.length; i++) {
        count += subtopics[i].getThreadCount();
    }
    return count;
};

app.Forum.data.Topic.prototype.SEARCH_OPTIONS = {
    name: 1,
    description: 1
};

app.Forum.data.Topic.prototype.presave = function(){
    if ( ! this.description ||
         "null" == this.description )
        this.description = "";

    log(this.SEARCH_OPTIONS);
    Search.index(this, this.SEARCH_OPTIONS);
};

app.Forum.data.Topic.prototype.changeCounts = function(threadCount, postCount){
    var topic = this;
    while(topic){
        topic.postCount += postCount;
        topic.threadCount += threadCount;
        db.forum.topics.save(topic);
        topic = topic.parent;
    }
};

app.Forum.data.Topic.prototype.setParent = function(topic){
    if(this.parent)
        this.parent.changeCounts(-this.threadCount, -this.postCount);
    if(topic)
        topic.changeCounts(this.threadCount, this.postCount);
    this.parent = topic;
};

app.Forum.data.Topic.prototype.subtThread = function(postCount){
    this.threadCountJustThis -= 1;
    this.changeCounts(-1, -postCount);
};

app.Forum.data.Topic.prototype.addThread = function(postCount){
    this.threadCountJustThis += 1;
    this.changeCounts(1, postCount);
};

app.Forum.data.Topic.prototype.recalculateAll = function(){
    this.threadCount = 0;
    this.postCount = 0;
    this.threadCountJustThis = 0;
    this.postCountJustThis = 0;

    var threads = db.forum.threads.find( { topic : this } ).toArray();
    this.threadCountJustThis = threads.length;
    for(var i=0; i < threads.length; i++){
        var thread = threads[i];
        thread.recalculate();
        this.postCountJustThis += thread.count;
    }

    this.threadCount = this.threadCountJustThis;
    this.postCount = this.postCountJustThis;

    subtopics = db.forum.topics.find( { parent : this } ).toArray();
    for(var i=0; i < subtopics.length; i++) {
        var subtopic = subtopics[i];
        subtopic.recalculateAll();
        this.postCount += subtopic.postCount;
        this.threadCount += subtopic.threadCount;
    }

    db.forum.topics.save(this);

};

app.Forum.data.Topic.list = function(parent, showHidden){
    var q = {parent: parent};
    if(! showHidden) q.hidden = false;
    return db.forum.topics.find(q).sort({order: 1});
};


db.forum.topics.setConstructor(app.Forum.data.Topic);
db.forum.topics.ensureIndex({order: 1});
