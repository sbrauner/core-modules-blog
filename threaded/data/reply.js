log.threaded.data.reply.debug("Running replyfile. threaded="+threaded + " data="+threaded.data);
core.content.html();

threaded.data.Reply = function(){
    this.ts = new Date();
    this.author = "";
    this.title = "";
    this.content = "";
    this.deleted = false;
};

threaded.data.Reply.sort = function(ary){
    return ary.sort( function (a, b) { return b.ts - a.ts; });
};

threaded.data.Reply.prototype.decoratorsRender = function(options){
    options = options || {};
    if(options.replyable == null) options.replyable = this.threaded_replyable;
    var reps = this.getReplies();
    for (var i in reps){
        if(i == "_dbCons") continue;
        this.threaded_pieces.reply(reps[i], options);
    }
};

threaded.data.Reply.prototype.validateReply = function(r){
    return true;
};

threaded.data.Reply.prototype.encodeContent = function(txt){
    return content.HTML.escape_html(txt);
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
        r.content = this.encodeContent(request.ncontent);
        if(this.validateReply(r)){
            desc.addReply(r);
            ret = r;
        }
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

log.threaded.data.reply.level = log.LEVEL.ERROR;
