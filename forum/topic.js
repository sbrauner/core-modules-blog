if ( ! Forum ) { Forum = {}; }

core.forum.posts();

Forum.Topic = function(){
    this.commentsEnabled = true;
    this.pinned = true;
};

Forum.Topic.list = function(){
    db.forum.topics.find({orderby: {pinned: true}}).limit(10);
};

/*
db.forum.posts.find( { topic : "xyz" : first : true } );

post = new Post();
db.forum.posts.save( post );

topic.first = post;
db.forums.topics.save( topic );

db.forums.topcs.find()[0].first;

*/
