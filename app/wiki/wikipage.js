app.wiki.WikiPage = function (name) {
    this.name = name || '';
    this.text = 'New WikiPage';
};

if (db) {
    db.wiki.ensureIndex( { name : 1 } );

    db.wiki.setConstructor( app.wiki.WikiPage );
}

/**
 * returns an array with the page name components split into an array
 */
app.wiki.WikiPage.prototype.getStructuredName = function() {
    return this.getDisplayName().split(/[.]/);
};

app.wiki.WikiPage.prototype.getDisplayName = function() {
    return this.name.replace(new RegExp('^' + app.wiki.config.prefix), '');
};

app.wiki.WikiPage.prototype.getParsedText = function() {
    if ( ! this.text )
        return "";
    if ( this.text.trim().length == 0 )
        return "";

    var s = (new app.wiki.WikiController.TEXT_PARSER()).toHtml(this.text, app.wiki.config.prefix).trim();
    if ( s.length == 0 )
        throw "parser broken?";

    return s;
};
