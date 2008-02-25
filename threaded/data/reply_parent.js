// Parent-based reply class.

core.threaded.data.reply();
threaded.data.ReplyParent = function(){
    threaded.data.Reply.call(this);
    this.parent = null;
};

threaded.data.ReplyParent.prototype = new threaded.data.Reply();
threaded.data.ReplyParent.prototype.constructor = threaded.data.ReplyParent;

threaded.data.ReplyParent.prototype.getReplies = function(){
    var ary = db[this.threaded_tablename].find({parent: this}).toArray();
    return threaded.data.Reply.sort(ary);
};

threaded.data.ReplyParent.prototype.addReply = function(rep){
    rep.parent = this;
    db[this.threaded_tablename].save(rep);
};

threaded.data.ReplyParent.prototype.getID = function(){
    return this._id;
};

threaded.data.ReplyParent.prototype.getDescendant = function(desc_id){
    if(desc_id == "true"){
        return this;
    }
    return db[this.threaded_tablename].findOne({_id: desc_id});
};

threaded.data.ReplyParent.initialize = function(obj){
    threaded.data.Reply.initialize(obj);
};

threaded.data.ReplyParent.find_Query = function(query){
    return db[this.prototype.threaded_tablename].find(query);
};
