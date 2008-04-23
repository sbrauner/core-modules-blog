content.HTML = {};

content.HTML._entities = [{s: '&', r: "&amp;"},
                          {s: '<', r: "&lt;"},
                          {s: '>', r: "&gt;"},
                          {s: '"', r: "&quot;"},
                          {s: "'", r: "&apos;"}];

// This doesn't touch any "weird" characters like &agrave; &clubs; or &OElig;
// My feeling is, if these characters got into our content, then we'd probably
// do best to set a good charset in the Content-Type header and then
// just pass them through to the client.
// If we really want to do this, we probably need to implement a
// convert-to-utf8 function, and I'm not enough of a Unicode wizard to do that.
// -Ethan

content.HTML.escape = function(str){
    for(var i in content.HTML._entities){
        var pair = content.HTML._entities[i];
        str = str.replace(new RegExp(pair.s, 'g'), pair.r);
    }
    return str;
};

content.HTML.escape_html = content.HTML.escape;

content.HTML.unescape_html = function(str){
    for(var i in content.HTML._entities){
        var pair = content.HTML._entities[i];
        str = str.replace(new RegExp(pair.r, 'g'), pair.s);
    }
    return str;
};

content.HTML.strip = function(s){
    s = s.replace(/<.+?>/g, "");
    s = s.replace(/&\w+;/g, "");
    s = s.replace(/&#\d+;/g, "");
    return s;
};

RSS = {};

RSS.clean = function( s ){

    // This is a slightly modified version of the RSS clean function in
    // blog.rss. We put this in a namespace so that it wouldn't conflict
    // with the clean function in the db namespace.
    s = s.replace( /&nbsp;/g , " " );
    s = s.replace( /&rsquo;/g , "'" );
    s = s.replace( /&[mn]dash;/g , "-" );
    s = s.replace( /&ldquo;/g , "'" );
    s = s.replace( /&rdquo;/g , "'" );

    s = s.replace( /(\w)&(\w)/g , "$1&amp;$2" );

    //s = s.replace( /<\/?embed[^>]*>/g , "" );
    s = s.replace( /mt:asset.id=.*? /g , "" );

    // Not really sure what Dana meant for this code to do; originally
    // he had it return " ", but I can't figure out what the rationale was.
    s = s.replace( /&(\w+);/g , function(z){
        return "&amp;";
                    } );

    s = s.replace( /</g , "&lt;" );
    s = s.replace( />/g , "&gt;" );

    return s;
}
