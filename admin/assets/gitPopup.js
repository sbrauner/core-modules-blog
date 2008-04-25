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

var checkoutOK = function(){
    confirmCheckout.hide();
    document.gitFiles.toBeDetermined.value = "checkout";
    document.gitFiles.toBeDetermined.name = "action";
    document.gitFiles.submit();
};

var checkoutCancel = function(){
    confirmCheckout.hide();
};

new YAHOO.util.YUILoader({
    onSuccess: function(){
        confirmCheckout = new YAHOO.widget.Dialog("confirmCheckout", {
            visible: false,
            width: "400px",
            fixedcenter: true,
            buttons: [{text: "Checkout", handler: checkoutOK},
                      {text: "Cancel", handler: checkoutCancel}]
        });

        confirmCheckout.render();
        document.getElementById("confirmCheckout").style.display = "block";
    }
}).insert();

var showConfirm = function(checkoutBtn){
    confirmCheckout.show();
    confirmCheckout.button = checkoutBtn;
};

var unaddSubmit = function(btn){
    document.gitFiles.toBeDetermined.value = btn.id;
    document.gitFiles.toBeDetermined.name = "action";
    document.gitFiles.submit();
};

var submitGit = function(action, fname){
    document.gitFiles.toBeDetermined.value = action;
    document.gitFiles.toBeDetermined.name = "action";
    if(fname){
        document.gitFiles.toBeFilename.value = fname;
        document.gitFiles.toBeFilename.name = "untracked_file";
    }
    document.gitFiles.submit();
    return false;
};

var handleCheckAll = function(btn){
    var name = btn.name;
    var type = btn.name.replace(/^checkAll_/, "");
    var newState = btn.checked;
    var checks = YAHOO.util.Dom.getElementsByClassName("check_"+type, 'input');
    for(var i = 0; i < checks.length; ++i){
        var check = checks[i];
        check.checked = newState;
    }
};

var setupCheckAll = function(cls){
    var checks = YAHOO.util.Dom.getElementsByClassName("check_"+cls, "input");
    var checkAllButtons = YAHOO.util.Dom.getElementsBy(function(i){ return i.name == "checkAll_"+cls; }, "input");
    var handler = function(e){
        var check = this;
        // if we were just unchecked, then we can no longer be "checked all",
        // so uncheck all the checkALlButtons
        if(! check.checked){
            console.log("Unchecking");
            for(var i = 0; i < checkAllButtons.length; i++){
                checkAllButtons[i].checked = false;
            }
        }
        // If we were just checked, then maybe we just completed the set.
        else {
            for(var i = 0; i < checks.length; ++i){
                if(checks[i].checked == false) return;
            }
            // If we got here, then all the checks are checked
            for(var i = 0; i < checkAllButtons.length; ++i){
                checkAllButtons[i].checked = true;
            }
        }
    };

    YAHOO.util.Event.addListener(checks, "click", handler);
};

setupCheckAll("changed_file");
setupCheckAll("untracked_file");
