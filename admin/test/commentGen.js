
totalPosts = db.blog.posts.count();

var posts = db.blog.posts.find().toArray();
var i=0;

var myFoo = core.util.random();
randGen = myFoo.getRandom(1);
while(true) {
    var randNum = Math.floor(randGen.nextFloat()*totalPosts);
    var post = posts[randNum];
    var id = post._id;
    r = {addComment : "yes", txt: "comment blitz: "+i, getRemoteIP : function(x) {
        return "127.0.0.1";
    }
        };
    Blog.handlePosts(r, post, user);
    if(!db.blog.posts.findOne({_id : id})) {
        log("POST DISAPPEARED! id: "+id+" i: "+i);
        return;
    }
    else {
        log("okay: "+id+" i: "+i);
    }
    i++;
}

/*var hpost = db.blog.posts.findOne();
log("hammering a single post: ");
r = {addComment : "yes", txt: "comment blitz2: "+i, getRemoteIP : function(x) {
    return "127.0.0.1";
}
    };
for(var i=0; i<1000; i++) {
    Blog.handlePosts(r, hpost, user);
    if(i%100 == 0) {
        if(!db.blog.posts.findOne({_id : id})) {
            log("POST DISAPPEARED! id: "+id+" i: "+i);
            return;
        }
        else {
            log("okay: "+id+" i: "+i);
        }
    }
}*/
