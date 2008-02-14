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

threaded.data.Reply.prototype.decoratorsHandle = function(){
    if(request.reply){
        if(request.ncontent){
            var desc = this.getDescendant(request.reply);
            r = new this.Reply();
            if(this.threaded_users){
                r.author = user;
            }
            else{
                r.author = request.nauthor;
            }
            r.title = request.ntitle;
            r.content = request.ncontent;
            desc.addReply(r);
        }
        else{
            if(request.reply == "true"){
                this.threaded_pieces.reply_form(true);
            }
        }
        return true;
    }
    else {
        u = addQuery(request.getURI(), {reply: true});
        print("<a href=\""+u+"\">Reply</a>");

    }
};

threaded.data.Reply.initialize = function(obj){
    obj.threaded_numPosts = 0;
};

core.util.format();
addQuery = function(uri, args){
    for(var prop in request){
        args[prop] = request[prop];
    }
    if(uri.indexOf('?') != -1){
        return uri + "+" + Util.format_queryargs(args);
    }
    return uri+"?"+Util.format_queryargs(args);
};
