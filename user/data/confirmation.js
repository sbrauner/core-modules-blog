// Class representing an account waiting to be confirmed
User.Confirmation = function(user){
    this.user = user;
};

core.db.db();
dbutil.associate(User.Confirmation, db.users.confirmations);
db.users.confirmations.setConstructor(User.Confirmation);

core.net.url();

core.core.mail();

User.Confirmation.prototype.send = function(){
    this.save();

    if(! mail){
        throw "mail is not configured";
    }

    // Send a mail to the user
    var subj = "[" + siteName + "] Confirmation email";
    var link = new URL('/~~/user/confirm_receive').addArg('id', this._id);
    link.hostname = request.getHost();
    link.port = request.getPort();
    link = link.toString();
    var body = "Dear "+this.user.nickname+
        "\n"+
        "Thanks for registering with "+siteName+". Before your user account is activated, you must verify your email address. Please click the link below or copy and past it into your browser.\n"+
        "\n"+
        "Your username: "+this.user.name+"\n"+
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

