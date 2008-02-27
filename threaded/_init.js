threaded = {};
core.threaded.data.reply_parent();
core.threaded.data.reply_children();

threaded.repliesEnabled = function(ns, clsname, args){
    // This really hairy function has the following goals:
    // * Replace ns[clsname] with a wrapper class which, on construction,
    //   calls an initializer of the right reply class.
    // * Add some variables to the class of the original ns[clsname].
    //   These include:
    //
    //   * Reply, which is a wrapper to the original reply class, perhaps
    //     with some other variables added.
    //   * getReplies and addReply, which are the methods from the right
    //     reply class.
    // These reasonable goals (essentially: creating two wrapper classes)
    // lead to a ton of garbage. FIXME: WE NEED TO DO THIS BETTER.

    var cls = ns[clsname];
    args = args || {};
    var tablename = args.tablename || clsname.toLowerCase()+"_replies";
    var style = args.style || "parent";
    var users = args.users || "auth";
    var replyable = args.replyable == null ? true : false;
    if(style == "parent"){
        var rcls = threaded.data.ReplyParent;
    }
    else {
        var rcls = threaded.data.ReplyChildren;
    }

    // Create wrapper class for rcls.
    cls.prototype.Reply = function(){
        rcls.call(this);
    };
    cls.prototype.Reply.prototype = new rcls();
    cls.prototype.Reply.prototype.constructor = cls.Reply;

    // This kind of sucks: ReplyChildren doesn't need tablename.
    // Maybe come up with a better approach here.
    cls.prototype.Reply.prototype.threaded_tablename = tablename;
    cls.prototype.Reply.prototype.threaded_pieces = core.threaded.html;
    cls.prototype.Reply.prototype.threaded_users = users;
    cls.prototype.Reply.prototype.threaded_replyable = replyable;

    // Add to cls the functions to make it behave like a Reply.
    cls.prototype.getReplies = rcls.getReplies;
    cls.prototype.addReply = rcls.addReply;
    cls.prototype.getDescendant = rcls.getDescendant;
    cls.prototype.saveDescendant = rcls.saveDescendant;
    cls.prototype.threaded_tablename = tablename;
    cls.prototype.threaded_replyable = replyable;
    cls.prototype.threaded_pieces = core.threaded.html;
    cls.prototype.threaded_users = users;
    cls.prototype.decoratorsRender = rcls.decoratorsRender;
    cls.prototype.decoratorsLinks = rcls.decoratorsLinks;
    cls.prototype.decoratorsHandle = rcls.decoratorsHandle;
    cls.prototype.encodeContent = rcls.encodeContent;
    cls.prototype.validateReply = rcls.validateReply;

    // Wrap the class itself so that we can let the reply class add its own
    // fields.
    ns[clsname] = function(){
        cls.call(this);
        rcls.initialize(this);
    };
    ns[clsname].prototype = new cls();
    ns[clsname].prototype.constructor = ns[clsname];
    db[tablename].setConstructor(cls.prototype.Reply);
    db[tablename].ensureIndex({ts: true});
};
