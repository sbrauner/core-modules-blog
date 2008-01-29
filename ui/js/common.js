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
