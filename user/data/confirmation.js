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

    if( ! mail){
        log.user.confirmation.error( "want to send confirmation but no mail configured" );
        return;
    }

    // Send a mail to the user
    var subj = "[" + siteName + "] Confirmation email";
    var link = User.fullLink('/confirm_receive').addArg('id', this._id.toString()).toString();

    var body = "Dear "+ this.user.getDisplayName() + "\n" +
        "\n"+
        "Thanks for registering with "+siteName+". Before your user account is activated, you must verify your email address. Please click the link below or copy and paste it into your browser.\n"+
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

