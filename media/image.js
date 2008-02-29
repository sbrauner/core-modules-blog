
Media.Image = function( file ){
    if ( file == null )
        throw "Media.Image can't be passed a null file";
    
    if ( file instanceof "ed.js.JSFile" ){
        assert( file.length );
        this._file = file;
    }
    else {
        throw "don't know what a : " + file.getClass() + " is.";
    }

};

Media.Image.prototype._getImage = function(){
    if ( this._img )
        return this._img;
    
    this._img = javaStatic( "javax.imageio.ImageIO" , "read" , this._file.sender() );

    return this._img;
};

/**
 * have to specify one or the other
 * @param x - desired x
 * @param y - desired y
 * @return JSFile
 */
Media.Image.prototype.scaleToSize = function( x , y , grow ){
    if ( ! ( x || y ) )
        throw "need x or y";
    
    var img = this._getImage();
    var h = img.getHeight();
    var w = img.getWidth();

    if ( x && x > w )
        return this;
    if ( y && y > h )
        return this;
    
    var xRatio = null;
    if ( x )
        xRatio = x / w;
    
    var yRatio = null;
    if ( y )
        yRatio = y / h;
    
    if ( ! x )
        xRatio = yRatio;
    
    print( "xRatio : " + xRatio + " yRatio : " + yRatio );
    //    return scaleRatio( xRatio , yRatio );
};

/**
 * @param xOrBoth - if this is specified it used for x scaling.  if no y, then its used for both
 * @param y - optional, if not present uses x
 * @return JSFile
 */
Media.Image.prototype.scaleRatio = function( xOrBoth , y ){
    if ( ! xOrBoth )
        throw "need x scale factor";
    
    var img = this._getImage();
    
    if ( xOrBoth == 1 && ( ! y || y == 1 ) )
        return this;

    var at = javaStatic( "java.awt.geom.AffineTransform" , "getScaleInstance" , xOrBoth , y || xOrBoth );
    var op = javaCreate( "java.awt.image.AffineTransformOp" , at , null );
    
    img = op.filter( img , null );

    var bao = javaCreate( "java.io.ByteArrayOutputStream" );
    var res = javaStatic( "javax.imageio.ImageIO" , "write" , img , "JPEG" , bao );
    if ( ! res )
        throw "i couldn't write";
    
    var bytes = bao.toByteArray();
    print( bytes.getClass() );
    img = javaCreate( "ed.js.JSInputFile" , this._file.filename.replace( /\.\w+$/ , ".jpg" ) , "image/jpeg" , bytes );

    return img;
};
