log.threaded.data.reply.debug("Running replyfile. threaded="+threaded + " data="+threaded.data);
core.content.html();
core.content.simple();
core.net.url();

threaded.data.Reply = function(){
    this.ts = new Date();
    this.author = "";
    this.title = "";
    this.content = "";
    this.deleted = false;
};

threaded.data.Reply.sort = function(ary){
    ary = ary.filter(function(u){return u});
    return ary.slice().sort( function(a, b) {
        return a.ts - b.ts;
    });
};

threaded.data.Reply.prototype.decoratorsRender = function(part, options){
    part = part || "replies";
    options = options || {};
    if(part == "threaded.replies"){
        if(options.replyable == null) options.replyable = this.threaded_replyable;
        var reps = this.getReplies();
        for (var i in reps){
            if(i == "_dbCons") continue;
            reps[i].render(options, this.threaded_pieces);
        }
    }
    if(part == "threaded.replylink"){
        if(! request.reply || request.reply_target){
            u = new URL(request.getURL()).replaceArg("reply", "true").toString();
            print("<a href=\""+u+"\">Reply</a>");
        }
    }
    if(part == "threaded.replyform"){
        if(request.reply == "true" && ! request.reply_target){
            this.threaded_pieces.reply_form.call(this, true, options);
        }
    }

};

threaded.data.Reply.prototype.validateReply = function(r){
    return true;
};

threaded.data.Reply.prototype.encodeContent = function(txt){
    var s = new content.Simple();
    txt = content.HTML.escape_html(txt);
    txt = s.toHtml(txt);
    return txt;
};

threaded.data.Reply.prototype.decoratorsHandle = function(args){
    var ret = false;
    args = args || {};
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
        r.content = this.encodeContent(request.ncontent);
        if(this.validateReply(r)){
            desc.addReply(r);
            ret = r;
        }
    }
    return ret;
};

threaded.data.Reply.prototype.render = function(options, pieces){
    pieces = pieces || core.threaded.html;
    pieces.reply(this, options);
};

threaded.data.Reply.initialize = function(obj){
    obj.threaded_numPosts = 0;
};

core.util.format();

log.threaded.data.reply.level = log.LEVEL.ERROR;
