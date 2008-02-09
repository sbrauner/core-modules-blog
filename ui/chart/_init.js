ui.chart = {};

ui.chart.head = [];

ui.chart.head.push( "<script src=\"/@@/mochi/1.3.1/lib/MochiKit.js\" type=\"text/javascript\"></script>\n" );
ui.chart.head.push( "<script src=\"/@@/plotkit/0.9.1/excanvas.js\" type=\"text/javascript\"></script>\n" );
ui.chart.head.push( "<script src=\"/@@/plotkit/0.9.1/Base.js\" type=\"text/javascript\"></script>\n" );
ui.chart.head.push( "<script src=\"/@@/plotkit/0.9.1/Layout.js\" type=\"text/javascript\"></script>\n" );
ui.chart.head.push( "<script src=\"/@@/plotkit/0.9.1/Canvas.js\" type=\"text/javascript\"></script>\n" );
ui.chart.head.push( "<script src=\"/@@/plotkit/0.9.1/SweetCanvas.js\" type=\"text/javascript\"></script>\n" );


ui.chart._checkHeadArray = function( a ){

    for ( var i=0; i<ui.chart.head.length; i++ )
        if ( ! a.contains( ui.chart.head[i] ) )
            return false;

    return true;
}

ui.chart.checkHead = function(){
    
    if ( globalHead && ui.chart._checkHeadArray( globalHead ) )
        return;

    if ( head && ui.chart._checkHeadArray( head ) )
        return;
    
    if ( head && ! head.isLocked() ){
        SYSOUT( "have head :(" );
        head.concat( ui.chart.head );
    }
    else {
        SYSOUT( "have nothing!!!" );
    }
};
  
ui.chart.checkHead();
