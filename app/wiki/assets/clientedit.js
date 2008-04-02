var clientEditLoader = new YAHOO.util.YUILoader();

var editKeyListener;
var renameKeyListener;
var deleteKeyListener;
var saveKeyListener;

var editKeySelector = { alt: false, keys: 69 };
var renameKeySelector = { alt: false, keys: 82 };
var deleteKeySelector = { alt: false, keys: 68 };
var saveKeySelector = { ctrl: true, keys: [13, 3] };

var editKeySelectorWebKit = { alt: true, keys: 69 };
var renameKeySelectorWebKit = { alt: true, keys: 82 };
var deleteKeySelectorWebKit = { alt: true, keys: 68 };
var saveKeySelectorWebKit = { alt: true, keys: 83 };

clientEditLoader.insert({
    require: ['event','container','dom','connection','element','button','editor'],
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
                    if (YAHOO.env.ua.webkit) {
                        editKeyListener = new YAHOO.util.KeyListener(document, editKeySelectorWebKit, handleEditKeyPress);
                    } else {
                        editKeyListener = new YAHOO.util.KeyListener(document, editKeySelector, handleEditKeyPress);
                    }
                    editKeyListener.enable();

                    if (YAHOO.env.ua.webkit) {
                        renameKeyListener = new YAHOO.util.KeyListener(document, renameKeySelectorWebKit, handleRenameKeyPress);
                    } else {
                        renameKeyListener = new YAHOO.util.KeyListener(document, renameKeySelector, handleRenameKeyPress);
                    }
                    renameKeyListener.enable();

                    if (YAHOO.env.ua.webkit) {
                        deleteKeyListener = new YAHOO.util.KeyListener(document, deleteKeySelectorWebKit, handleDeleteKeyPress);
                    } else {
                        deleteKeyListener = new YAHOO.util.KeyListener(document, deleteKeySelector, handleDeleteKeyPress);
                    }
                    deleteKeyListener.enable();
                }

                // only set this up on an edit page
                if (isEditPage) {
                    if (YAHOO.env.ua.webkit) {
                        saveKeyListener = new YAHOO.util.KeyListener(document, saveKeySelectorWebKit, handleSaveKeyPress);
                    } else {
                        saveKeyListener = new YAHOO.util.KeyListener(document, saveKeySelector, handleSaveKeyPress);
                    }
                    saveKeyListener.enable();
                }

                // Reset the rename input (see the bugtracker for info)
                document.getElementById("newNameInput").value = document.getElementById("newNameInput").defaultValue;
            });
    }
});

var handleEditKeyPress = function() {
    // redirect to edit page
    window.location = window.location + "?edit=true";
}

var handleRenameKeyPress = function(e, obj) {
    document.getElementById('rename_popup').style.display = 'block';
    renameDialog.show();
    editKeyListener.disable();
    renameKeyListener.disable();
    deleteKeyListener.disable();
    if(isEditPage){
        // Otherwise, there's no save key
        saveKeyListener.disable();
    }
    searchKeyListener.disable();
    homeKeyListener.disable();
    obj[1].preventDefault();
    obj[1].stopPropagation();
}

var handleDeleteKeyPress = function(e, obj) {
    document.getElementById('delete_popup').style.display = "block";
    deleteDialog.show();
    editKeyListener.disable();
    renameKeyListener.disable();
    deleteKeyListener.disable();
    if(isEditPage){
        saveKeyListener.disable();
    }
    searchKeyListener.disable();
    homeKeyListener.disable();
}

var handleSaveKeyPress = function(e, obj) {
    document.forms.wiki_edit_form.submit();
}

var handleConfirm = function() {
    this.submit();
    editKeyListener.enable();
    renameKeyListener.enable();
    deleteKeyListener.enable();
    if(isEditPage){
        saveKeyListener.enable();
    }
    searchKeyListener.enable();
    homeKeyListener.enable();
}

var handleCancel = function() {
    this.hide();
    editKeyListener.enable();
    renameKeyListener.enable();
    deleteKeyListener.enable();
    if(isEditPage){
        saveKeyListener.enable();
    }
    searchKeyListener.enable();
    homeKeyListener.enable();
};
