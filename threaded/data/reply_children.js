// Children-based reply class.
core.threaded.data.reply();

threaded.data.ReplyChildren = function(){
    call(threaded.data.Reply, this);
    this.threaded_children = [];
};

threaded.data.ReplyChildren.prototype = new threaded.data.Reply();
threaded.data.ReplyChildren.prototype.constructor = threaded.data.ReplyChildren;

threaded.data.ReplyChildren.prototype.getReplies = function(){
    var ary = this.threaded_children;
    return threaded.data.Reply.sort(ary);
};

threaded.data.ReplyChildren.initialize = function(obj){
    threaded.data.Reply.initialize(obj);
    obj.threaded_children = [];
};
