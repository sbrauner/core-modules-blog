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

threaded.data.Reply.prototype.decoratorsHandle = function(args){
    var ret = false;
    args = args || {};
    var replylink = ! args.noreplylink;
    if(request.reply == "true" && ! request.reply_target ){
        this.threaded_pieces.reply_form.call(this, true);
        return;
    }
    else
    if(request.reply_target){
        var desc = this.getDescendant(request.reply);
        r = new this.Reply();
        if(this.threaded_users == "free"){
            r.author = request.nauthor;
        }
        else{
            r.author = user;
        }
        r.title = request.ntitle;
        r.content = request.ncontent;
        desc.addReply(r);
        ret = r;
    }
    if(replylink){
        u = addQuery({reply: true});
        print("<a href=\""+u+"\">Reply</a>");
    }
    return ret;
};

threaded.data.Reply.initialize = function(obj){
    obj.threaded_numPosts = 0;
};

core.util.format();
addQuery = function(args){
    var url = request.getURL();
    var obj = {};
    var qs = url.indexOf('?');
    var opts = url.substring(qs+1, url.length);
    var ary = opts.split(/&/);
    for (var i in ary){
        var pair = ary[i].split(/=/);
        obj[pair[0]] = pair[1];
    }
    for (var i in args){
        obj[i] = args[i];
    }
    var uri = request.getURI();
    return uri+"?"+Util.format_queryargs(obj);
};
