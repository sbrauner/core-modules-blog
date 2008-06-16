/**
 * User
 *   email
 *   url
 *   name
 *   nickname
 *   firstname, lastname (optional)
 * FIXME: use better names for these fields?
 * name -> username, nickname -> displayname
 */

User.prototype.setPassword = function( pass , name ){
    if ( ! name )
        name = db.getName();
    this.pass_ha1_name = md5( this.name + ":" + name + ":" + pass );
    this.pass_ha1_email = md5( this.email + ":" + name + ":" + pass );
};

User.prototype.checkPasswordClearText = function( pass ){
    if ( this.pass_ha1_name == md5( this.name + ":" + db.getName() + ":" + pass ) )
        return true;

    if ( this.pass_ha1_email == md5( this.email + ":" + db.getName() + ":" + pass ) )
        return true;

    return false;
};

User.prototype.checkPasswordDigest = function( pass ){
    if ( this.pass_ha1_name == pass )
         return true;
    if ( this.pass_ha1_email == pass )
        return true;
    return false;
};

User.prototype.isAdmin = function(){
    return this.hasPermission( "admin" );
};

/**
 *  @return copy of array of permissions. Can be empty.
 */
User.prototype.getPermissions = function(){
    if (!this.permissions) {
        return [];
    }

    return this.permissions.slice();
};

User.prototype.hasPermission = function( perm ){
    if ( ! this.permissions )
        return false;

    return this.permissions.contains( perm.toLowerCase() ) || this.permissions.contains( "superadmin" );
};

User.prototype.addPermission = function( perm ){
    if ( ! this.permissions )
        this.permissions = Array();
    this.permissions.push( perm.toLowerCase() );
};

User.prototype.removePermission = function( perm ){
    if ( ! this.permissions )
        return;
    var i = this.permissions.indexOf(perm);
    if ( i == -1 )
        return;
    this.permissions.splice(i, 1);
};

User.prototype.getDisplayName = function( ){
    return this.nickname || this.name;
};

User.prototype.presave = function( ){
    log.user.presave.debug("calling presave on " + tojson(this));
    if(this.uniqueness_hash == md5(this.name + ":" + this.email + ":" +
                                   this.nickname))
        return;

    log.user.presave.debug("hash is wrong");
    // Either this.uniqueness_hash is missing or name/email has changed
    // Either way, scan the DB for users with these attributes

    if(this.name == ""){
        throw "name is required";
    }
    if(this.email == ""){
        throw "email is required";
    }

    var t = this;

    if(t._id)
        var isDuplicate = function(obj){
            var matches = db.users.find(obj).toArray();
            matches = matches.filter(function(u){ return u._id != t._id; });
            log.user.presave.debug("matches: " + tojson(matches));
            return (matches.length != 0);
        }
    else
        var isDuplicate = function(obj){
            return db.users.findOne(obj);
        }

    log.user.presave.debug("using duplicate-checking function " + isDuplicate);

    if(isDuplicate({name: this.name})){
        throw "user has duplicate name: " + this.name;
    }
    if( isDuplicate({email: this.email}) ){
        throw "user has duplicate email: " + this.email;
    }

    this.uniqueness_hash = md5(this.name + ":" + this.email + ":" + this.nickname);
};

User.find = function( thing , theTable ){
    if ( ! theTable )
        theTable = db.users;

    theTable.setConstructor( User );

    if ( ! thing )
        return null;

    var u = { length: function(){ return 0; } }; // or DBCursor to db.users
    if ( thing.match( /@/ ) )
        u = theTable.find( { email : content.RegExp.literal(thing, 'i') } );

    if ( u.length() == 0 )
        u = theTable.find( { name : thing } );

    if ( u.length() == 0 && theTable.base != "admin" && thing.match( /@10gen.com/ ) )
        return User.find( thing , db[".admin.users"] );

    if ( u.length() == 0 ) return null;

    if ( u.length() != 1 ){
        throw Exception.Redirect(User.findMyLocation() + "/fixDuplicate?thing="+thing);
    }

    return u[0];
};

if ( db ){
    db.users.setConstructor( User );

    db.users.ensureIndex( { email : 1 } );
    db.users.ensureIndex( { name : 1 } );
    db.users.ensureIndex( { permissions : 1 } );
}

User.statusName = function(status){
    if(status == "confirmed_email")
        return "confirming your email";

};

User.statusLink = function(status){
    if(status == "confirmed_email")
        return new URL(User.findMyLocation()+"confirm_send").toString()
};

User.fixURL = function(url){
    if ( ! url )
        return url;
    if ( url.startsWith( "http://" ) ||
         url.startsWith( "https://" ) ||
         url.startsWith( "/" ) )
        return url;
    return 'http://'+url;
};

log.user.level = log.LEVEL.ERROR;

return 0;

