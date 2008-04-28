

link_to = function( pretty ){
    return "<a href='#'>" + pretty + "(broken)</a>";
};

error_messages_for = function( what ){
    return "(this should be error messages for: " + what + ")<br>";
};

form_for = function( what , frm ){

    if ( ! what )
        throw "form_for passed null";

    print( "<form action='broken' class='new_" + what.collectionName + "' id='new_" + what.collectionName + "' method='post'>" );

    var newThing = what;
    if ( isFunction( what ) ){
        newThing = new what();
    }

    frm( newThing );
    print( "</form>" );
};

stylesheet_link_tag = function( name ){
    return "<link href='/stylesheets/" + name + ".css' media='screen' rel='stylesheet' type='text/css' />";
}

// crap

edit_person_path = function(){
  return "broken";
};

