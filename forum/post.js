// FIXME: implement a more interesting forum using a comments-on-comments system
// Right now I'm implementing this the simple "flat" way, just to get acquainted
// with the system

Forum.Post = function() {
    this.author = null;
    this.title = "";
    this.content = "";
    this.firstpost = false;
    this.parent = null;
};

Forum.Post.findFirstPost = function(topic){
    return db.forum.posts.findOne( { firstpost: true, parent: topic });
};


Forum.Post.findAllPosts = function(topic){
    return db.forum.posts.find( {parent: topic} );
};
