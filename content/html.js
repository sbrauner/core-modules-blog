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

content.HTML.escape_html = function(str){
    for(var i in content.HTML._entities){
        pair = content.HTML._entities[i];
        str = str.replace(new RegExp(pair.s, 'g'), pair.r);
    }
    return str;
};

content.HTML.unescape_html = function(str){
    for(var i in content.HTML._entities){
        pair = content.HTML._entities[i];
        str = str.replace(new RegExp(pair.r, 'g'), pair.s);
    }
    return str;
};
