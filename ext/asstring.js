core.ext.redirect();

Ext.asString = function(f){
    // Ext.redirect except we only want the output and trim.
    // This should probably be moved to Ext.redirect.asString or something?
    var value = Ext.redirect(f);
    return value.output.trim();
};
