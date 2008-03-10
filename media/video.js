// video.js

var mylog = log.media.video;
mylog.level = log.LEVEL.DEBUG;

Media.Video = function( file ){
    if ( file == null )
        throw "Media.Video can't be passed a null file";
    
    if ( file instanceof "ed.js.JSFile" ){
        assert( file.length );
        this._file = file;
    }
    else {
        throw "don't know what a : " + file.getClass() + " is.";
    }    
};


Media.Video.prototype.getIMG = function(){
    this.getFLV();
    return db._files.findOne( this._file.imgID );
};

Media.Video.prototype.getFLV = function(){
    if ( this._file.flvID )
        return db._files.findOne( this._file.flvID );

    if ( this._file.filename.match( /\.flv$/ ) )
        return this._file;

    var doRM = true;

    mylog.info( "going to encode : " + this._file.filename );

    var r = Math.random();
    
    var localTempRaw = "/tmp/media_video_flv_" + r + "_" + this._file.filename;
    var tempRaw = this._file.writeToLocalFile( localTempRaw );
    var absRoot = tempRaw.substring( 0 , tempRaw.length - localTempRaw.length );
    var tempFlv = tempRaw.replace( /\.\w+$/ , ".flv" );
    
    mylog.debug( "\t" + tempRaw );
    mylog.debug( "\t" + tempFlv );

    var cmd = "mencoder ";
    cmd += " -of lavf ";
    cmd += " -oac mp3lame ";
    cmd += " -lameopts abr:br=56 ";
    cmd += " -srate 22050 ";
    cmd += " -ovc lavc ";
    cmd += " -lavcopts vcodec=flv:mbd=2:trell:v4mv ";
    cmd += " -lavfopts i_certify_that_my_video_stream_does_not_use_b_frames ";
    cmd += " -vf scale=320:240 ";
    cmd += " -o " + tempFlv + " " + tempRaw;

    var encodingResult = sysexec( cmd );
    if ( doRM ) sysexec( "rm " + tempRaw );
    
    var flv = openFile( tempFlv.substring( absRoot.length ) );
    if ( flv.length == 0 )
        throw "encoding issue...<br>";// + tojson( encodingResult );

    db._files.save( flv );
    this._file.flvID = flv._id;    
    
    flv = db._files.findOne( flv._id );
    if ( flv.length == 0 )
        throw "encoding problem? :(";
    
    var imgBase = tempFlv.replace( /.flv$/ , "%d.jpg" );
    cmd = "ffmpeg -i " + tempFlv + " -an -r 1 -y -s 320x240 -vframes 10 " + imgBase;
    
    sysexec( cmd );
    
    var img = openFile( imgBase.replace( /%d/ , "10" ).substring( absRoot.length ) );
    if ( img.length == 0 )
        throw "img error";
    db._files.save( img );
    this._file.imgID = img._id;

    db._files.save( this._file );
    
    if ( doRM ){
        sysexec( "rm " + tempFlv );
        for ( var i=1; i<=10; i++ )
            sysexec( "rm " + imgBase.replace( /%d/ , "" + i ) );
    }
    
    return flv;
};
