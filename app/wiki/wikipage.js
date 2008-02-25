core.util.diff();
core.app.wiki.wikipagehistory();

app.wiki.WikiPage = function(name) {
    this.name = name || '';
    this.text = 'New WikiPage';
    this.lastEdit = new Date();
};

if (db) {
    db.wiki.ensureIndex( { name : 1 } );
    db.wiki.ensureIndex( { lastEdit : 1 } );

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

    return this.formatText(this.text);
};

app.wiki.WikiPage.prototype.formatText = function(text){
    var s = (new app.wiki.WikiController.TEXT_PARSER()).toHtml(text, app.wiki.config.prefix).trim();
    if ( s.length == 0 )
        throw "parser broken?";

    return s;
};

/**
 * Updates the text of a saved WikiPage with the new text. The new text is expected to be in a markup language.
 * @returns true if page was properly saved with history, false if newText was empty or wiki is read only.
 */
app.wiki.WikiPage.prototype.setText = function(newText) {
    if (!newText || newText.length == 0) return false;
    if (app.wiki.config.readOnly) return false;

    // get a diff of the text of the Wiki, and save it in a WikiHistory object.
    var textDiff = Util.Diff.diff(this.text, newText);

    var wikiPageHistory = new app.wiki.WikiPageHistory(this._id, textDiff);

    // change the wikiPage text now, after we have an historical log.
    this.text = newText;

    this.lastEdit = new Date();
    // save the updated wikiPand the history for the page.
    db.wiki.save(this);

    // If the page is new, the parent needs to be set (again).
    if(wikiPageHistory.parent == null) wikiPageHistory.parent = this._id;
    db.wiki_history.save(wikiPageHistory);
};

/**
 * Gets the list of all WikiPageHistory objects for the current page
 * @returns null if no history is found
 */
app.wiki.WikiPage.prototype.getWikiPageHistories = function() {
    // get the WikiPageHistory objects for the current page
    return db.wiki_history.find( { parent: this._id } ).sort( { ts: -1 } );
};

/**
 * Gets the WikiPageHistory object identified by the given id
 * @returns null if no history is found
 */
app.wiki.WikiPage.prototype.getWikiPageHistory = function(wikiPageHistoryId) {
    // get the WikiPageHistory objects for the current page
    return db.wiki_history.findOne( { parent: this._id, _id: wikiPageHistoryId } );
}