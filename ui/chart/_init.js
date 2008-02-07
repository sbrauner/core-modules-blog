ui.chart = {};

var myHead = [];

myHead.push( "<script src=\"/@@/mochi/1.3.1/lib/MochiKit.js\" type=\"text/javascript\"></script>\n" );
myHead.push( "<script src=\"/@@/plotkit/0.9.1/excanvas.js\" type=\"text/javascript\"></script>\n" );
myHead.push( "<script src=\"/@@/plotkit/0.9.1/Base.js\" type=\"text/javascript\"></script>\n" );
myHead.push( "<script src=\"/@@/plotkit/0.9.1/Layout.js\" type=\"text/javascript\"></script>\n" );
myHead.push( "<script src=\"/@@/plotkit/0.9.1/Canvas.js\" type=\"text/javascript\"></script>\n" );
myHead.push( "<script src=\"/@@/plotkit/0.9.1/SweetCanvas.js\" type=\"text/javascript\"></script>\n" );

if ( head ){
    SYSOUT( "have head :(" );
    head.concat( myHead );
}
else if ( globalHead ){
    SYSOUT( "have global head :)" );
    globalHead.concat( myHead );
}
else {
    SYSOUT( "have nothing!!!" );
}
