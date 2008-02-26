Forum.data.Topic = function(){
    this.name = null;
    this.description = null;
    this.hidden = false;
    this.allowPosts = true;
    this.order = null;

    // Housekeeping fields
    this.latestPost = null;
    this.parent = null;
    this.postCount = 0;
    this.threadCount = 0;
};

Forum.data.Topic.list = function(parent){
    return db.forum.topics.find({parent: parent}).sort({order: 1});
};

db.forum.topics.setConstructor(Forum.data.Topic);
