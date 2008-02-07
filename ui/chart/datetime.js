
/**
   this has to work client and server side
 */

ui.chart.DateTime = function(){

    this._dataName = "data123" ;
    this._dataCode = " var " + this._dataName + " = [];";

    this.height = 500;
    this.width = 700;

    this._min = new Date();
    this._max = new Date();
};


/**
 * @param date 
 * @param value
 * @param series (optional) if you have multiple lines
 */
ui.chart.DateTime.prototype.add = function( date , value , series ){
    this._dataCode += this._dataName + ".push( [" + date.getTime() + "," + value +  "] );";

    if ( date < this._min )
        this._min = date;
    
    if ( date > this._max )
        this._max = date;
};

ui.chart.DateTime.prototype.print = function( myPrint ){
    
    var layoutName = "layout" + this._dataName;

    myPrint( "<div style=\"width:" + this.width + "px; height:" + this.height + "px; \">\n" );
    myPrint( "<div><canvas id=\"chart" + this._dataName + "\" width=\"" + this.width + "\" height=\"" + this.height + "\"></canvas></div>\n" );
    
    myPrint( "<script type=\"text/javascript\">\n" );
    myPrint( "var " + layoutName + " = new Layout(\"line\");\n" );

    myPrint( this._dataCode );
    
    myPrint( layoutName + ".options.xAxis = [ " +  this._min.getTime() + " , " +  this._max.getTime() + " ];\n" );
    
    myPrint( layoutName + ".addDataset( \"d1\" , " + this._dataName + " );\n" );
    
    myPrint( layoutName + ".xTickLabeler = function(z){ return new Date(z); };\n" );
    
    myPrint( layoutName + ".evaluate();\n" );

    myPrint( "var chart = new SweetCanvasRenderer($(\"chart" + this._dataName + "\"), " + layoutName + ");\n" );
    myPrint( "chart.render();\n" );
    
    myPrint( "</script>\n" );
    myPrint( "</div>\n" );
};
