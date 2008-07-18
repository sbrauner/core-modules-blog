
core.modules.blog.urls();

request = {};

    request.action = "save";
    request["title"] = "Post "+i;
    request.name = "post_"+i;
    request.content = "Story: transfer from savings to checking account   As a savings account holder  I want to transfer money from my savings account to my checking accounte  So that I can get cash easily from an ATM  Scenario: savings account has sufficient funds    Given my savings account balance is $100    And my checking account balance is $10    When I transfer $20 from savings to checking    Then my savings account balance should be $80    And my checking account balance should be $30  Scenario: savings account has insufficient funds    Given my savings account balance is $50e    And my checking account balance is $10    When I transfer $60 from savings to checking    Then my savings account balance should be $50    And my checking account balance should be $10";
    request.excerpt = "Story: transfer from savings to checking account   As a savings account holder  I want to transfer money from my savings account to my checking accounte";
    if(i%10 == 0) request.categories = "_feature";
    request.live = true;
    request.commentsEnabled = true;
    request.getHost = function() {
        return "";
    };

for(var i=1; i<=162; i++) {
    var post = core.modules.blog.admin.post_edit();
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
