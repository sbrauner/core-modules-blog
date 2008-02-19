var clientLoader = new YAHOO.util.YUILoader();

clientLoader.insert({
    require: ['event','dom'],
    base: '/@@/yui/current/',

    onSuccess: function(loader) {
            YAHOO.util.Event.onDOMReady( function() {
                // only set these up on a non-edit page
                searchKeyListener = new YAHOO.util.KeyListener(document, { alt: true, keys: 83 }, handleSearchKeyPress);
                searchKeyListener.enable();

                homeKeyListener = new YAHOO.util.KeyListener(document, { alt: true, keys: 72 }, handleHomeKeyPress);
                homeKeyListener.enable();
            });
        }
});    

var handleSearchKeyPress = function() {
    window.location = 'search';
}

var handleHomeKeyPress = function() {
    window.location = 'Main';
}
