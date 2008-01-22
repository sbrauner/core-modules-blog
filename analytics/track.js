var pixelParams = "?rand=" + Math.random() + "&";

function addPixelParam( n , v ){
    pixelParams += n + "=" + v + "&";
}

function setCookie( name , value , seconds ) {
    var expires = "";

    if ( seconds ) {
        var date = new Date();
        date.setTime( date.getTime() + ( seconds * 1000 ) );
        expires = "; expires=" + date.toGMTString();
    }

    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie( name )  {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];

        while (c.charAt(0)==' '){
            c = c.substring(1,c.length);
        }

        if (c.indexOf(nameEQ) == 0){
            return c.substring(nameEQ.length,c.length);
        }
    }
    return null;
}

// title
var possTitles = document.getElementsByTagName( "title" );
if ( possTitles && possTitles.length > 0 )
    addPixelParam( "title" , possTitles[0].innerHTML );
        
// search

// referer

// refererSearch

// section

function doUniqueStuff( c , p , t ){
    if ( getCookie( c ) )
        return;
    setCookie( c , "t" , t );
    addPixelParam( p , "t" );
}
doUniqueStuff( "uh" , "uniqueHour" , 3600 );
doUniqueStuff( "ud" , "uniqueDay" , 3600 * 24 );
doUniqueStuff( "um" , "uniqueMonth" , 3600 * 24 * 30 );

function writePixel(){
    var root = "";
    if ( trackRoot )
	root = trackRoot;
    document.write( "<img src=\"" + root + "/~~/analytics/pixel.jxp" + pixelParams + "\" width=1 height=1 border=0>" );    
}

writePixel();


