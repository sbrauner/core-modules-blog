
/**
 * User
 *   email
 *   url
 *   name
 *   nickname
 */

function User(){
    
};

User.prototype.setPassword = function( pass ){
    this.pass_ha1_name = md5( this.name + ":" + db.getName() + ":" + pass );
    this.pass_ha1_email = md5( this.email + ":" + db.getName() + ":" + pass );
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
    
    return this.permissions.contains( perm.toLowerCase() );
};

User.prototype.addPermission = function( perm ){
    if ( ! this.permissions )
        this.permissions = Array();
    this.permissions.push( perm.toLowerCase() );
};


User.find = function( thing ){

    if ( ! thing )
        return null;
    
    if ( thing.match( /@/ ) )
        return db.users.findOne( { email : thing } );
    
    var u = db.users.findOne( { name : thing } );
    if ( u )
        return u;

    return null;
};

if ( db ){
    db.users.setConstructor( User );
    
    db.users.ensureIndex( { email : 1 } );
    db.users.ensureIndex( { name : 1 } );
}
