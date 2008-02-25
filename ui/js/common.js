
String.prototype.trim = function(){
    return this.replace( /(^ *| *$)/ , "" );
};

function getElement( e ){
    if ( typeof(e) == "string" )
        return document.getElementById( e );
    return e;
};

function showElement( e ){
    e = getElement( e );
    e.style.display = "block";
}

function hideElement( e ){
    e = getElement( e );
    e.style.display = "none";
}

function loadDocSync( url ){
    if ( ! window.XMLHttpRequest && ! window.ActiveXObject ){
        return "";
    }

    var req = null;
    // branch for native XMLHttpRequest object
    if (window.XMLHttpRequest) {
        req = new XMLHttpRequest();
        req.open("GET", url, false);
        req.send(null);
    }
    else if (window.ActiveXObject) {// branch for IE/Windows ActiveX version
        req = new ActiveXObject("Microsoft.XMLHTTP");
        if (req) {
            req.open("GET", url, false);
            req.send();
        }
    }

    if ( ! req )
        return "";

    var d = req.responseText;
    if ( ! d )
        return "";

    return d;
}
