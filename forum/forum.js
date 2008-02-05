Forum.Forum = function(){
    this.name = null;
    this.description = null;
    this.order = null;
    this.latestPost = null;
    this.postCount = 0;
    this.threadCount = 0;
};

Forum.Forum.list = function(){
    return db.forum.forums.find().sort({index: 1});
};

db.forum.forums.setConstructor(Forum.Forum);
