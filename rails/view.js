
Rails.View = {};

var myContentCache = {};

ActionController.Base.prototype.content_for = function( name , func ){

    var savePrint = print;
    
    var s = globals.getTLPreferred();
    var buf = "";
    s.print = function( foo ){
        buf += foo;
    }

    func.apply( this );

    var blah = "content_for_" + name;
    this[ blah ] = buf;
    
    s.print = savePrint;
};


ActionController.Base.prototype.render = function( options ){

    if ( ! options )
        throw "are you allowed to pass render nothing?";

    if ( options.partial ){

        var controllerName = myController.shortName;
        var pieceName = null;

        var blah = options.partial.split( "/" );        
        if ( blah.length == 2 ){
            controllerName = blah[0];
            pieceName = blah[1];
        }
        else if ( blah.length == 1 )
            pieceName = blah[0];
        else
            throw "can't handle partial [" + options.partial + "]";
        
        var p = local.app.views[ controllerName ][ "_" + pieceName + ".html" ];
        if  ( ! p )
            throw "couldn't find [" + options.partial + "]";


        // START TOTAL GUESS
        if ( options.object ){
            SYSOUT( "options.object : " + options.object );
            p.getScope( true ).putExplicit( pieceName , options.object );
        }
        // END TOTAL GUESS (as if the rest isn't)
        
        p.apply( this );
        return "";
    }

    return "don't know what do do with render : " + tojson( options );
}


ActionController.Base.prototype.form_for = function( what , options ){
    
    var frm = arguments[ arguments.length - 1 ];

    if ( ! what )
        throw "form_for passed null";

    if ( ! isFunction( frm ) )
        throw "form_for.frm is not a function";

    if ( isString( what ) ){
        what = Rails.findModel( what );
    }

    print( "\n<form action='/" + myController.shortName );
    if ( what._id )
        print( "/" + what._id );

    print( "' class='new_" + what.collectionName + "' id='new_" + what.collectionName + "' method='post'>\n" );

    var newThing = what;
    if ( isFunction( what ) ){
        newThing = new what();
    }
    
    frm.call( this , newThing );
    print( "\n</form>\n" );
};


ActionController.Base.prototype.submit_tag = function( name ){
    return "<input type='submit' name='action' value='" + name + "'>";
}