// Class representing an email that was sent to reset a user's password
User.Reset = function(user){
    this.user = user;
    this.hash = md5(new Date().toString());
};

core.db.db();
dbutil.associate(User.Reset, db.users.resets);
db.users.resets.setConstructor(User.Reset);

core.net.url();

core.core.mail();

User.Reset.prototype.send = function(){
    this.save();

    if(! mail){
        throw "mail is not configured";
    }

    var link = User.fullLink('/reset_receive').addArg("hash", this.hash).toString();
    // Send a mail to the user
    var subj = "[" + siteName + "] Reset password";
    var body = "Dear "+(this.user.nickname || this.user.name)+ "\n" +
        "\n"+
        "Someone asked us to reset your password. If you really want that, please follow this link:"+
        "\n"+
        link+"\n"+
        "\n"+
        "Regards,\n"+
        "\n"+
        siteName;

    m = new Mail.Message( subj, body );
    m.addRecipient(  this.user.email  );
    m.send( mail );
};

