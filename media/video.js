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


Media.Video.prototype.getFLV = function(){
    if ( this._file.flvID )
        return db._files.findOne( file.flvID );

    if ( this._file.filename.match( /\.flv$/ ) )
        return this._file;

    mylog.info( "going to encode : " + this._file.filename );

    var r = Math.random();
    
    var tempRaw = "/tmp/media_video_flv_" + r + "_" + this._file.filename;
    tempRaw = this._file.writeToLocalFile( tempRaw );
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

    sysexec( cmd );
    
    var flv = openFile( tempFlv );
    db._files.save( flv );
    this._file.flvID = flv._id;    

    
    var imgBase = tempFlv.replace( /.flv$/ , "%d.jpg" );
    cmd = "ffmpeg -i " + tempFlv + " -an -r 1 -y -s 320x240 -vframes 10 " + imgBase;
    
    sysexec( cmd );
    
    var img = openFile( imgBase.replace( /%d/ , "10" ) );
    mylog.debug( "img.length : " + img.length );
    db._files.save( img );
    this._file.imgID = img._id;

    db._file.save( this._file );
    
    sysexec( "rm " + tempFlv );
    sysexec( "rm " + tempRaw );
    for ( var i=1; i<=10; i++ )
        sysexec( "rm " + imgBase.replace( /%d/ , "" + i ) );
    
    return db._files.findOne( flv._id );
};
