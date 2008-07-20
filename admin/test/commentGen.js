
/**
*      Copyright (C) 2008 10gen Inc.
*  
*    Licensed under the Apache License, Version 2.0 (the "License");
*    you may not use this file except in compliance with the License.
*    You may obtain a copy of the License at
*  
*       http://www.apache.org/licenses/LICENSE-2.0
*  
*    Unless required by applicable law or agreed to in writing, software
*    distributed under the License is distributed on an "AS IS" BASIS,
*    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*    See the License for the specific language governing permissions and
*    limitations under the License.
*/

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
