/**
 * User
 *   email
 *   url
 *   name
 *   nickname
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


User.find = function( thing , theTable ){
    if ( ! theTable )
        theTable = db.users;

    theTable.setConstructor( User );

    if ( ! thing )
        return null;

    var u = null;
    if ( thing.match( /@/ ) )
        u = theTable.findOne( { email : thing } );

    if ( ! u )
        u = theTable.findOne( { name : thing } );

    if ( ! u && theTable.base != "admin" && thing.match( /@10gen.com/ ) )
        return User.find( thing , db[".admin.users"] );

    return u;
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
        return new URL("/~~/user/confirm_send").toString()
};
