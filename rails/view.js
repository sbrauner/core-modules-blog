
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


ActionController.Base.prototype.render = function( options ){

    if ( ! options )
        throw "are you allowed to pass render nothing?";

    if ( options.partial ){
        var blah = options.partial.split( "/" );
        if ( blah.length != 2 )
            throw "can't handle partial [" + options.partial + "]";
        var p = local.app.views[ blah[0] ][ "_" + blah[1] + ".html" ];
        if  ( ! p )
            throw "couldn't find [" + options.partial + "]";
        p.apply( this );
        return "";
    }

    return "don't know what do do with render : " + tojson( options );
}
