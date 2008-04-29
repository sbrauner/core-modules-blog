

error_messages_for = function( what ){
    return "(this should be error messages for: " + what + ")<br>";
};

form_for = function( what , frm ){

    if ( ! what )
        throw "form_for passed null";

    print( "\n<form action='/" + myController.shortName );
    if ( what._id )
        print( "/" + what._id );
    print( "' class='new_" + what.collectionName + "' id='new_" + what.collectionName + "' method='post'>\n" );

    var newThing = what;
    if ( isFunction( what ) ){
        newThing = new what();
    }

    frm( newThing );
    print( "\n</form>\n" );
};

// -----
// -- ui 
// -----


stylesheet_link_tag = function( name ){
    return "<link href='/stylesheets/" + name + ".css' media='screen' rel='stylesheet' type='text/css' />";
}

// TODO: ???

h = function( thing ){
    return thing; 
}

link_to = function( pretty , thing , options ){
    var url = Rails.routes.getLinkFor( thing );
    html = "<a href='" + url  + "' ";
    
    if ( options && ( options.confirm || options.method ) ){
        // have to do a post

        html += " onclick=\"if ( ! confirm('" + options.confirm + "') ) return false; ";

        html += "var f = document.createElement('form'); ";
        html += "f.style.display = 'none'; this.parentNode.appendChild(f); f.method = 'POST'; f.action = this.href;";
    
        if ( options.method ){
            html += "var m = document.createElement('input'); m.setAttribute('type', 'hidden'); m.setAttribute('name', '_method'); m.setAttribute('value', '" + options.method + "'); ";
            html += "f.appendChild(m); ";
        }
        
        //html += " var s = document.createElement('input'); s.setAttribute('type', 'hidden'); s.setAttribute('name', 'authenticity_token'); ";
        //html ++ "s.setAttribute('value', '316a87b08f57486444d37dc6eb2082b5a3a7590a'); f.appendChild(s);";
        
        html += "f.submit();";
        html += "return false;";
        html += "\" ";
    }

    html += ">" + pretty + "</a>";
    return html;
};



// crap

edit_person_path = function(){
  return "broken";
};

edit_todo_path = function(){
    return "broken";
};
