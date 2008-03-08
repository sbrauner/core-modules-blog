core.content.search();

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
    this.changeCounts(-1, -postCount);
};

app.Forum.data.Topic.prototype.addThread = function(postCount){
    this.changeCounts(1, postCount);
};

app.Forum.data.Topic.list = function(parent, showHidden){
    var q = {parent: parent};
    if(! showHidden) q.hidden = false;
    return db.forum.topics.find(q).sort({order: 1});
};


db.forum.topics.setConstructor(app.Forum.data.Topic);
db.forum.topics.ensureIndex({order: 1});
