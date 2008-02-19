
/**
   this has to work client and server side
 */

ui.chart.checkHead( head );

ui.chart.DateTime = function(){

    this._dataName = "data" + md5( Math.random() );
    this._dataCode = "";
    this._series = {};

    this.height = 500;
    this.width = 700;
    
    this._min = new Date();
    this._max = new Date( 0 );
};


/**
 * @param date 
 * @param value
 * @param series (optional) if you have multiple lines
 */
ui.chart.DateTime.prototype.add = function( date , value , series ){
    if ( ! series )
        series = "DEFAULT";
    
    this._series[series] = true;

    this._dataCode += this._dataName + series + ".push( [" + date.getTime() + "," + value +  " ] );";
    
    if ( date < this._min )
        this._min = date;
    
    if ( date > this._max )
        this._max = date;
};

ui.chart.DateTime.prototype.print = function( myPrint ){
    
    core.ui.chart.html.datetime( { chart : this , layoutName : "layout" + this._dataName } );

};


