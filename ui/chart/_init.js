ui.chart = {};

ui.chart.head = [];

ui.chart.head.push( "<script src=\"NOCDN/@@/mochi/1.3.1/packed/MochiKit.js\" type=\"text/javascript\"></script>\n" );
ui.chart.head.push( "<script src=\"NOCDN/@@/plotkit/0.9.1/Base.js\" type=\"text/javascript\"></script>\n" );
ui.chart.head.push( "<script src=\"NOCDN/@@/plotkit/0.9.1/excanvas.js\" type=\"text/javascript\"></script>\n" );
ui.chart.head.push( "<script src=\"NOCDN/@@/plotkit/0.9.1/Layout.js\" type=\"text/javascript\"></script>\n" );
ui.chart.head.push( "<script src=\"NOCDN/@@/plotkit/0.9.1/Canvas.js\" type=\"text/javascript\"></script>\n" );
ui.chart.head.push( "<script src=\"NOCDN/@@/plotkit/0.9.1/SweetCanvas.js\" type=\"text/javascript\"></script>\n" );


ui.chart._checkHeadArray = function( a ){

    for ( var i=0; i<ui.chart.head.length; i++ )
        if ( ! a.contains( ui.chart.head[i] ) )
            return false;

    return true;
}

ui.chart.checkHead = function( myHead ){
    
    if ( globalHead && ui.chart._checkHeadArray( globalHead ) )
        return;
    
    if ( ! head ) head = myHead;

    if ( head && ui.chart._checkHeadArray( head ) )
        return;

    if ( head ){
	if ( head.isLocked() )
	    throw "why is head locked";
        head.addAll( ui.chart.head );
	return;
    }
    
    throw "have no way to add head";
};
  
