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

