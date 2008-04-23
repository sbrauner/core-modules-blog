var popup = function(href){
    window.open(href, 'diff', 'width=600,height=640,scrollbars=1');
    return false;
};

var popupDiffAll = function(){
    var myChecks = [];
    var inputs = document.getElementsByTagName("input");
    var myParams = [];
    for(var i = 0; i < inputs.length; ++i){
        if(inputs[i].type == "checkbox" && inputs[i].name == "changed_file"){
            myChecks.push(inputs[i]);
        }
    }
    for(var i = 0; i < myChecks.length; ++i){
        if(! myChecks[i].checked) continue;
        myParams.push("file="+myChecks[i].value);
    }
    var href = "gitDiff?"+myParams.join("&");
    popup(href);
};
