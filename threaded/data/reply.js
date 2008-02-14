threaded.data.Reply = function(){
    this.ts = Date();
    this.author = "";
    this.title = "";
    this.content = "";
};

threaded.data.Reply.sort = function(ary){
    return ary.sort( function (a, b) { return b.ts - a.ts; });
};

threaded.data.Reply.prototype.decoratorsRender = function(){
    var reps = this.getReplies();
    for (var i in reps){
        this.threaded_pieces.reply(reps[i]);
    }
};

threaded.data.Reply.prototype.decoratorsLinks = function(){
    u = request.getURI()+"?reply=true";
    return "<a href=\""+u+"\">Reply</a>";
};

threaded.data.Reply.prototype.decoratorsHandle = function(){
    if(request.reply){
        u = request.getURI();
        if(request.ncontent){
            var desc = this.getDescendant(request.reply);
            r = new this.Reply();
            r.author = request.nauthor;
            r.title = request.ntitle;
            r.content = request.ncontent;
            desc.addReply(r);
        }
        else{
            if(reply == "true")
                this.threaded_pieces.reply_form(true);
        }
        return true;
    }
};

threaded.data.Reply.initialize = function(obj){
    obj.threaded_numPosts = 0;
};
