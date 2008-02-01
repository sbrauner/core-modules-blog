if ( ! Forum ) { Forum = {}; }

core.forum.post();

Forum.Topic = function(){
    this.commentsEnabled = true;
    this.pinned = true;
};

Forum.Topic.list = function(){
    db.forum.topics.find({orderby: {pinned: true}}).limit(10);
};
