Mail = {};

Mail.log = log.core.mail;
Mail.recipientTypes = [ "to" , "cc" , "bcc" ];
Mail.recipientTypesJava = [ javaStaticProp( "javax.mail.Message:RecipientType" , "TO" ) , 
                            javaStaticProp( "javax.mail.Message:RecipientType" , "CC" ) , 
                            javaStaticProp( "javax.mail.Message:RecipientType" , "BCC" ) ];

Mail.Message = function( subject , content ){
    this.subject = subject;
    this.content = content;
};

/**
 * @param to email address
 * @param type can be null, or "to" , "cc" , "bcc"
 */
Mail.Message.prototype.addRecipient = function( addr , type ){
    type = ( type || "to" ).toLowerCase();


    if ( ! Mail.recipientTypes.contains( type ) )
        throw " don't know type [" + type + "]";
    
    if ( ! this[ type ] )
        this[type] = Array();
            
    this[type].push( addr );

    Mail.log.debug( "added recipient for type [" + type + "]" );
};

Mail.Message.prototype.send = function( smtp ){
    var m = javaCreate( "javax.mail.internet.MimeMessage" , smtp._session );

    m.setFrom( javaCreate( "javax.mail.internet.InternetAddress" , smtp.addr ) );
    m.setSubject( this.subject );
    m.setContent( this.content , "text/plain" );
    
    for ( var i=0; i<Mail.recipientTypes.length; i++ ){
        
        var type = Mail.recipientTypes[i];
        
        if ( ! this[type] ) 
            continue;
        
        var realType = Mail.recipientTypesJava[i];
        
        this[type].forEach( function(z){
                m.addRecipient( realType , javaCreate( "javax.mail.internet.InternetAddress" , z ) );
            } );
        
    }

    javaStatic( "javax.mail.Transport" , "send" , m );
};

Mail.SMTP = function( addr , server , username , password , ssl , port ){
    
    this.addr = addr;
    this.server = server;
    this.username = username;
    this.password = password;
    
    this.ssl = ssl || false;
    this.port = port || ( ssl ? 465 : 25 );

    if ( ! this.server )
        throw "server is required";

    if ( ! this.username )
        throw "username is required";

    if ( ! this.password )
        throw "password is required";

    this._props = javaCreate( "java.util.Properties" );
    this._props.setProperty( "mail.smtp.host" , this.server );
    this._props.setProperty( "mail.smtp.auth" , "true" );
    this._props.setProperty( "mail.smtp.port" , this.port );

    this._props.setProperty( "mail.smtp.socketFactory.port" , this.port );
    this._props.setProperty( "mail.smtp.socketFactory.class" , "javax.net.ssl.SSLSocketFactory" );
    this._props.setProperty( "mail.smtp.socketFactory.fallback" , "false" );
    
    this._session = javaStatic( "ed.util.MailUtil" , "createSession" , this._props , this.username , this.password );
    
};


Mail.SMTP.gmail = function( username , password ){
    if ( ! username.match( /@gmail.com$/ ) )
        username += "@gmail.com";
    
    return new Mail.SMTP( username , "smtp.gmail.com" , username , password , true , 465 );
};


// Creates a new imap session (not connected)
Mail.IMAP = function( addr , server , username , password , ssl , port ){
    
    this.addr = addr;
    this.server = server;
    this.username = username;
    this.password = password;
    
    this.starttls = {};
    this.starttls.enable = true;
    this.port = port;

    if ( ! this.server )
        throw "server is required";

    if ( ! this.username )
        throw "username is required";

    if ( ! this.password )
        throw "password is required";
    

    this._props = javaCreate( "java.util.Properties" );
    this._props.setProperty( "mail.imap.host" , this.server );
    this._props.setProperty( "mail.imap.port" , this.port );

    this._props.setProperty( "mail.imap.socketFactory.port" , this.port );
    this._props.setProperty( "mail.imap.socketFactory.class" , "javax.net.ssl.SSLSocketFactory" );
    this._props.setProperty( "mail.imap.socketFactory.fallback" , "false" );
    
    this._props.setProperty( "mail.debug", "true");
    this._session = javaStatic( "ed.util.MailUtil" , "createSession" , this._props , this.username , this.password );
    
};


// Returns an array of Java MimeMessages from the gmail inbox
Mail.IMAP.gmail = function( username , password ){
    if ( ! username.match( /@gmail.com$/ ) )
        username += "@gmail.com";
    
    imap = new Mail.IMAP( username , "imap.gmail.com" , username , password , true , 993 );
    imap._session.setDebug(true);

    var store = imap._session.getStore("imap");
    store.connect("imap.gmail.com", 993, "10gen.auto@gmail.com","jumpy171");
    
    if(!store.isConnected()) {
	log("not connected");
	return;
    }

    var folder = store.getFolder("INBOX");
    if(!folder.exists()) {
	log("the folder does not exist.");
	return;
    }

    folder.open(1);
    return folder.getMessages();
};


