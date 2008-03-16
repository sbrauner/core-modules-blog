
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

function getXMLRequestObject(){

    if ( window.XMLHttpRequest )
        return new XMLHttpRequest();
    
    if (window.ActiveXObject) // branch for IE/Windows ActiveX version
        return new ActiveXObject("Microsoft.XMLHTTP");

    throw "no XMLHttpRequest support";
}

function loadDocSync( url , data ){

    var req = getXMLRequestObject();
    req.open( data ? "POST" : "GET", url, false);
    req.send( data );

    var d = req.responseText;
    if ( ! d )
        return "";

    return d;
}

function loadDocAsync( url , handler , data , passFullRequest ){

    var req = getXMLRequestObject();
    req.open( data ? "POST" : "GET", url, true );
    
    req.onreadystatechange = function() {
        if ( req.readyState == 4 && handler ){
            handler( passFullRequest ? req : req.responseText );
        }
    }
            
    req.send( data );
}

function ajax(passData, to, responder, method) {

    if ( ! method)
        method = "POST";

    var xmlhttp = getXMLRequestObject();

    xmlhttp.open(method, to, true);
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4) {
            if(responder)
                responder(xmlhttp.responseText);
        }
    }
    xmlhttp.send(passData);
}

function getCSSClass( e ){
    e = getElement( e );
    if ( e ){
	return e.className;
    }
    return null;
}

function setClass( e , c ){
    e = getElement( e );
    if ( e ){
	e.className = c;
    }
}
