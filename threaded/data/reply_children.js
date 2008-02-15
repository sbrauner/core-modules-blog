// Children-based reply class.
core.threaded.data.reply();

threaded.data.ReplyChildren = function(){
    threaded.data.Reply.call(this);
    this.threaded_children = [];
    this.parentid = "";
    this.index = "";
};

threaded.data.ReplyChildren.prototype = new threaded.data.Reply();
threaded.data.ReplyChildren.prototype.constructor = threaded.data.ReplyChildren;

threaded.data.ReplyChildren.prototype.getReplies = function(){
    var ary = this.threaded_children;
    return threaded.data.Reply.sort(ary);
};

threaded.data.ReplyChildren.prototype.addReply = function(r){
    r.index = this.threaded_children.push(r)-1;
    r.parentid = (this.getID && this.getID());
};

threaded.data.ReplyChildren.prototype.getID = function(){
    return this.parentid? this.parentid + '.': "" + this.index;
};

threaded.data.ReplyChildren.prototype.getDescendant = function(desc_id){
    if(desc_id == "true"){
        return this;
    }
    ary = desc_id.split(/\./);
    var child = this;
    for(var i in ary){
        var index = ary[i];
        child = child.threaded_children[index];
    }
    return child;
};

threaded.data.ReplyChildren.initialize = function(obj){
    threaded.data.Reply.initialize(obj);
    obj.threaded_children = [];
};

