
function fnCallback(e) {
    if(e.target.className != "partialText" )
        return;

    if(e.ctrlKey == false) {
        var divs = YAHOO.util.Dom.getElementsByClassName("fullText");
        for(var i=0; i<divs.length; i++) {
            divs[i].style.display = "none";
        }
    }
    if(YAHOO.util.Dom.getNextSibling(e.target))
        YAHOO.util.Dom.getNextSibling(e.target).style.display = "block";
}

document.getElementById("myCollection").addEventListener('click', fnCallback, false);


