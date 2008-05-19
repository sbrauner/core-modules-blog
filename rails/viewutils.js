

error_messages_for = function( what ){
    return "(this should be error messages for: " + what + ")<br>";
};



// -----
// -- basic html tags
// -----


stylesheet_link_tag = function( name ){
    return "<link href='/stylesheets/" + name + ".css' media='screen' rel='stylesheet' type='text/css' />";
}

javascript_include_tag = function(){
    var html = "";
    arguments.forEach( 
        function(z){
            html += "<script src=\"/javascripts/" + z + ".js\" ></script>" ;
        }
    );
    return html;
}

javascript_tag = function( code ){
    return "<script>" + code + "</script>";
}

auto_discovery_link_tag = function(){
    // TODO
    return "";
}

h = function( thing ){
    return thing; 
}

image_tag = function( url , options ){
    var html = "<a href=\"" + escape( url ) + "\" ";
    if ( options ){
        for ( var n in options ){
            html += " " + n + "=\"" + options[n] + "\" ";
        }
    }
    html += ">";
    return html;
}

form_tag = function( url , options , cont ){
    print( "BROKEN FORM" );
}

// ----

number_with_delimiter = function( number ){
    // TODO: finish
    return number;
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

link_to_function = function( name ){
    return "<a href='#'>" + name + " BROKEN</a>" ;
}


