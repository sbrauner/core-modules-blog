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

threaded.data.Reply.prototype.decoratorsLinks = function(){
    u = request.getURI()+"?reply=true";
    return "<a href=\""+u+"\">Reply</a>";
};

threaded.data.Reply.prototype.decoratorsHandle = function(){
    if(request.reply){
        u = request.getURI()+"?reply=true";
        if(request.ncontent){
            SYSOUT("adding reply");
            r = new this.Reply();
            r.author = request.nauthor;
            r.title = request.ntitle;
            r.content = request.ncontent;
            this.addReply(r);
        }
        else{
            print("<form =\""+u+"\">");
            print("<input type=\"hidden\" name=\"id\"/>");
            print("<input type=\"hidden\" name=\"reply\" value=\"true\"/>");
            print("Author: <input type=\"text\" name=\"nauthor\"><br/>");
            print("Topic: <input type=\"text\" name=\"ntitle\"><br/>");
            print("<textarea rows=20 cols=80 name=\"ncontent\"></textarea><br/>");
            print("<input type=\"submit\" value=\"save\">");
            print("</form>");
        }
        return true;
    }
};

threaded.data.Reply.initialize = function(obj){
    obj.threaded_numPosts = 0;
};
