// Parent-based reply class.

core.threaded.data.reply();
threaded.data.ReplyParent = function(){
    threaded.data.Reply.call(this);
    this.parent = null;
};

threaded.data.ReplyParent.prototype = new threaded.data.Reply();
threaded.data.ReplyParent.prototype.constructor = threaded.data.ReplyParent;

threaded.data.ReplyParent.prototype.getReplies = function(){
    var ary = [];//db[this.tablename].find({parent: this}).toArray();
    return threaded.data.Reply.sort(ary);
};

threaded.data.ReplyParent.initialize = function(obj){
    threaded.data.Reply.initialize(obj);
};
