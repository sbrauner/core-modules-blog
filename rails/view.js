
Rails.View = {};

var myContentCache = {};

ActionController.Base.prototype.content_for = function( name , func ){
    var s = func.getScope( true );
    var buf = "";
    s.print = function( foo ){
        buf += foo;
    }
    func.apply( this );

    var blah = "content_for_" + name;
    this[ blah ] = buf;
};
