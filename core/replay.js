// replay.js

/*
* USAGE:

// in _init.js
core.core.replay();
replay = new ReplayServer( "test.10gen.com" );

function allowed( req , res , uri ){
  replay.send( req );
}

*/


ReplayServer = function( server , port , hostname ){
    this.server = server;
    this.port = port || 80;
    this.hostname = hostname || server;

    if ( ! this.server )
        throw "need to specify a server";

    this._replay = javaCreate( "ed.net.httpserver.Replay" , this.server , this.port , this.hostname );
};


/**
* @return whether or not it was succesfully added to queue
*/
ReplayServer.prototype.send = function( req ){
    return this._replay.send( req );
}
