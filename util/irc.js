// irc.js


Util.IRC = {};

Util.IRC.Logger = function( host , nick , channel ){
    if ( ! db )
        throw "no db to save logs too :(";

    this.host = host;
    this.nick = nick;
    
    if ( ! this.host )
        throw "need host";
    
    if ( ! this.nick )
        throw "need nick";

    this._bot = javaCreate( "ed.toys.IRCBot" , this.host , this.nick );
    assert( this.onMessage );
    this._bot.onMessage = this.onMessage;

    this.channel = channel;
    if ( this.channel )
        this._bot.joinChannel( channel );
};

Util.IRC.Logger.prototype.onMessage = function( msg ){

    msg.ts = new Date();

    db.ircLogs.save( msg );
    if ( this.first ){
        this.first = false;
        db.ircLogs.ensureIndex( ts );
    }

};
