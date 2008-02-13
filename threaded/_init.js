threaded = {};
core.threaded.data.reply_parent();
core.threaded.data.reply_children();

threaded.repliesEnabled = function(ns, clsname, style){
    var cls = ns[clsname];
    var rcls;
    if(style == "parent"){
        rcls = threaded.data.ReplyParent;
    }
    else {
        rcls = threaded.data.ReplyChildren;
    }
    cls.Reply = function(){
        apply(rcls, this);
    };
    cls.Reply.prototype = new rcls();
    cls.Reply.prototype.constructor = cls.Reply;
    cls.Reply.prototype.tablename = clsname;
    cls.prototype.getReplies = rcls.getReplies;
    ns[clsname] = function(){
        rcls.initialize(this);
    };
    ns[clsname].prototype = new cls();
    ns[clsname].prototype.constructor = ns[clsname];
};
