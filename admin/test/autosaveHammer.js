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

// Incomplete: just dumps a bunch of drafts into the table
// A good simulation would load some drafts and save them as posts, etc

db = connect("test-autosave");

db.blog.drafts.remove({});
db.blog.posts.remove({});

allowModule = { blog: { } };
admin = {getRoles: function(){
    return [{name: 'author'}];
} };
routes = {find: function(){ return "/blog"; }};

core.testing.client();

var autoSaveRequest = function(n, i, id){
    var request = {};

    request.id = id;
    request["title"] = "Post "+n;
    request.name = "post_"+n;
    request.cls = "entry";
    request.ts = new Date();
    request.author = "Some Guy";
    request.content = "This is the #"+n+" post, being saved the #"+i+" time";
    request.excerpt = "Hi guys; I'm on the internet!";
    if(i%10 == 0) request.categories = "_feature";
    request.live = true;
    request.commentsEnabled = true;

    request.suppressImage = false;
    request.new_categories = "";
    request.comment_notify = false;

    request.action = "save";

    return request;
};

for(var n=1; n<=162; n++) {
    var id = "";
    for(var i = 1; i < 4001; i++) {
        var t = new testing.Client();
        t.setURL("http://localhost:8080/admin/blog/test/fury");
        t.addArgs(autoSaveRequest(n, i, id));
        if(i % 100){
            id = t.withPermission('author', core.modules.blog.admin.autosave);
            if(i%50 == 0) print("id: "+id);
        }
        else {
            var txt = t.withPermission('author', core.modules.blog.admin.post_edit);
            id = /<input type="hidden" name="id" value="([^"]+)"/.exec(txt)[1]; //"
            print("really saved id: "+id);
        }

        assert(db.blog.drafts.validate().valid);
    }
}

/*    var post = core.modules.blog.admin.post_edit();
    db.blog.postCount.save({id: post._id});

    // comments
    var randNum = Math.floor(Math.random()*11);
    for(var j=0; j<randNum; j++) {
        r = {addComment : "yes", txt: "comment "+j, getRemoteIP : function(x) {
            return "127.0.0.1";
        }
            };
        Blog.handlePosts(r, post, user);
    }

    if(i%10 == 0) {
        var count1 = db.blog.posts.count();
        var count2 = db.blog.postCount.count();
        log("c1: "+count1+", c2: "+count2);
        assert(count1 == count2);
    }
}
*/