// image.js

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

Media.Image.prototype.scaleToMaxSize = function( maxWidth , maxHeight ){
    var img = this._getImage();
    var w = img.getWidth();
    var h = img.getHeight();

    var newWidth = w;
    var newHeight = h;

    if ( maxWidth && maxWidth < newWidth ){
	newHeight = ( maxWidth / newWidth ) * newHeight;
	newWidth = maxWidth;
    }

    if ( maxHeight && maxHeight < newHeight ){
	newWidth = ( maxHeight / newHeight ) * newWidth;
	newHeight = maxHeight;
    }

    if ( newWidth == w && newHeight == h )
	return this._file;

    return this.scaleToSize( newWidth , newHeight );
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
        return this._file;
    if ( y && y > h )
        return this._file;
    
    var xRatio = null;
    if ( x )
        xRatio = x / w;
    
    var yRatio = null;
    if ( y )
        yRatio = y / h;
    
    if ( ! x )
        xRatio = yRatio;
       
    return this.scaleRatio( xRatio , yRatio );
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
        return this.file;
    
    img = javaStatic( "ed.util.ImageUtil" , "getScaledInstance" , img , xOrBoth * img.getWidth() , ( y || xOrBoth ) * img.getHeight() );
    return javaStatic( "ed.util.ImageUtil" , "imgToJpg" , img , 0 , this._file.filename.replace( /\.\w+$/ , ".jpg" ) );
};


Media.Image.giveIMGTagsURLMaxes = function( html ){
    html = html.replace( /<img ([^>]+)\/?>/ , 
			 function( tag ){
			     
			     if ( ! tag.match( /f?id/ )){
				 return tag;
			     }
			     
			     var maxX = null;
			     var maxY = null;

			     var p = /width="?(\d+)"? /;
			     var r = p.exec( tag );
			     if ( r )
				 maxX = r[1];

			     p = /height="?(\d+)"? /;
			     r = p.exec( tag );
			     if ( r )
				 maxY = r[1];
			     
			     if ( ! ( maxX || maxY ) )
				 return tag;

			     var options = "";
			     if ( maxX ) options += "&maxX=" + maxX;
			     if ( maxY ) options += "&maxY=" + maxY;

			     tag = tag.replace( /src="[^"]*(f\?id[^"]+)/ , "src=\"/~~/$1" + options );

			     return tag;
			 } );
    
    return html;
};
