
Rails.View = {};

var myContentCache = {};

ActionController.Base.prototype.content_for = function( name , func ){
    var s = func.getScope( true );
    var buf = "";
    s.print = function( foo ){
        buf += foo;
    }
    func.apply( this );
    this[ "content_for_" + name ] = buf;
};
