core.db.db();

app.Forum.data.PendingUser = function(){
    this.email = "";
    this.url = "";
    this.name = "";
    this.nickname = "";
    this.password = "";
};

dbutil.associate(app.Forum.data.PendingUser, db.forum.pendingusers);
