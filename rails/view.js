
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

    var controllerName = myController.shortName;
    var pieceName = null;

    var name = null;
    if ( isString( options ) )
        name = options;
    else if ( options.partial )
        name = options.partial;
    else
        throw "cannot render [" + tojson( options ) + "]";
    
    var blah = name.split( "/" );        
    if ( blah.length == 2 ){
        controllerName = blah[0];
        pieceName = blah[1];
    }
    else if ( blah.length == 1 )
        pieceName = blah[0];
    else
        throw "can't handle [" + name + "]";
    
    var p = local.app.views[ controllerName ][ ( options.partial ? "_" : "" ) + pieceName + ".html" ];
    if  ( ! p )
        throw "couldn't find [" + name + "]";
    

    // START TOTAL GUESS
    if ( options.object ){
        SYSOUT( "options.object : " + options.object );
        p.getScope( true ).putExplicit( pieceName , options.object );
    }
    // END TOTAL GUESS (as if the rest isn't)
        
    p.apply( this );
    return "";
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
    return "<input type='submit' name='action' value='" + ( name || "Submit" ) + "'>";
}
