Forum.Topic = function(){
    this.name = null;
    this.description = null;
    this.order = null;
    this.latestPost = null;
    this.postCount = 0;
    this.threadCount = 0;
};

Forum.Topic.list = function(){
    return db.forum.topics.find().sort({order: 1});
};

db.forum.forums.setConstructor(Forum.Topic);
