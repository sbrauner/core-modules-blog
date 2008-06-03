var clientLoader = new YAHOO.util.YUILoader();

var searchKeyListener;
var homeKeyListener;

var searchKeySelector = { alt: false, keys: 83 };
var homeKeySelector = { alt: false, keys: 72 };

var searchKeySelectorWebKit = { alt: true, keys: 83 };
var homeKeySelectorWebKit = { alt: true, keys: 72 };

var textFocus = false;

clientLoader.insert({
    require: ['event','dom'],
    base: '/@@/yui/current/',

    onSuccess: function(loader) {
        YAHOO.util.Event.onDOMReady( function() {
            // only set these up on a non-edit page
            if (!isEditPage) {
                if (YAHOO.env.ua.webkit) {
    		        searchKeyListener = new YAHOO.util.KeyListener(document, searchKeySelectorWebKit, handleSearchKeyPress);
                } else {
    		        searchKeyListener = new YAHOO.util.KeyListener(document, searchKeySelector, handleSearchKeyPress);
                }
                searchKeyListener.enable();
            }

            if (YAHOO.env.ua.webkit) {
                homeKeyListener = new YAHOO.util.KeyListener(document, homeKeySelectorWebKit, handleHomeKeyPress);
            } else {
                homeKeyListener = new YAHOO.util.KeyListener(document, homeKeySelector, handleHomeKeyPress);
            }
            homeKeyListener.enable();
        });
    }
});

var handleSearchKeyPress = function() {
    if(document.getElementById("searchtext") && textFocus) return;
    window.location = 'search';
}

var handleHomeKeyPress = function() {
    if(document.getElementById("searchtext") && textFocus) return;
    window.location = 'Main';
}
