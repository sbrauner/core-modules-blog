var clientEditLoader = new YAHOO.util.YUILoader();

clientEditLoader.insert({
    require: ['fonts','event','container','dom','connection','element','button','editor'],
    base: '/@@/yui/current/',

    onSuccess: function(loader) {
            YAHOO.util.Event.onDOMReady( function() {
                // create the delete dialog
                deleteDialog = new YAHOO.widget.Dialog("delete_popup", {
                                        fixedCenter: true,
                                        visible: false,
                                        fixedCenter: true,
                                        constraintoviewport: true,
                                        draggable: false,
                                        modal: true,
                                        postmethod: 'form',
                                        buttons: [ { text: "Cancel", handler: handleCancel, isDefault: true},
                                                   { text: "Delete Page", handler: handleConfirm } ]
                                    });
                deleteDialog.cfg.setProperty("icon", YAHOO.widget.SimpleDialog.ICON_WARN);
                deleteDialog.setHeader('Confirm Delete');
                deleteDialog.setBody('Are you sure you want to delete this page? Deleting a page cannot be undone.');
                deleteDialog.render();
                deleteDialog.registerForm();
                deleteElement = document.createElement("input");
                deleteElement.name = 'delete';
                deleteElement.type = 'hidden';
                deleteElement.value = true;
                deleteDialog.form.appendChild(deleteElement);
                
                // create the rename dialog
                renameDialog = new YAHOO.widget.Dialog("rename_popup", {
                                        fixedCenter: true,
                                        visible: false,
                                        fixedCenter: true,
                                        constraintoviewport: true,
                                        draggable: false,
                                        modal: true,
                                        postmethod: 'form',
                                        buttons: [ { text: "Cancel", handler: handleCancel, isDefault: true},
                                                   { text: "Rename Page", handler: handleConfirm } ]
                                    });
                renameDialog.cfg.setProperty("icon", YAHOO.widget.SimpleDialog.ICON_WARN);
                renameDialog.render();

                // only set these up on a non-edit page
                if (!isEditPage) {
                    editKeyListener = new YAHOO.util.KeyListener(document, { ctrl: true, keys: 69 }, handleEditKeyPress);
                    editKeyListener.enable();

                    renameKeyListener = new YAHOO.util.KeyListener(document, { ctrl: true, keys: 82 }, handleRenameKeyPress);
                    renameKeyListener.enable();

                    deleteKeyListener = new YAHOO.util.KeyListener(document, { ctrl: true, keys: 68 }, handleDeleteKeyPress);
                    deleteKeyListener.enable();
                }
                
                // only set this up on an edit page
                if (isEditPage) {
//                    saveKeyListener = new YAHOO.util.KeyListener(document, { ctrl: true, keys: 13 }, handleConfirm);
//                    saveKeyListener.enable();
                } 
            });
    }
});    

var handleEditKeyPress = function() {
    // redirect to edit page
    window.location = window.location + "?edit=true";
}

var handleRenameKeyPress = function() {
    renameDialog.show();
}

var handleDeleteKeyPress = function() {
    deleteDialog.show();
}

var handleConfirm = function() {
    this.submit();
}

var handleCancel = function() { 
    this.hide(); 
};    

