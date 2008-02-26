log("importing wikipage history, app="+app+" app.wiki="+app.wiki);
app.wiki.WikiPageHistory = function(wikiPageId, textDiff) {
    this.parent = wikiPageId;
    this.diff = textDiff;
    this.ts = new Date();
};

if (db) {
    db.wiki_history.ensureIndex( { ts: 1} );

    db.wiki_history.setConstructor( app.wiki.WikiPageHistory );
}


/**
 * Gets the full text of a specific historical version of the current page
 * @param the WikiPageHistory object representing the version requested
 */
// TODO this should allow diffs between two WikiPageHistory objects
app.wiki.WikiPageHistory.prototype.getHistoricalText = function() {
    // get our parent WikiPage
    var wikiPage = db.wiki.findOne( { _id : this.parent } );
    if (!wikiPage) throw new Exception("Can't find my WikiPage parent!");

    // Get the list of all WikiPageHistory objects for the current page. We assume this is in reverse chronological order.
     var wikiPageHistories = wikiPage.getWikiPageHistories();

     // iterate through each WikiPageHistory object, in reverse chronological order
     // for each WikiPageHistory object, apply the diff backwards (to back out the changes)
     // stop after we've processed the wikiPageHistory requested (after applying the backwards diff).
     var historicalText = wikiPage.text;
     for (var i in wikiPageHistories) {
         wikiPageHistory = wikiPageHistories[i];
         historicalText = Util.Diff.applyBackwards(historicalText, wikiPageHistory.diff);

         if (this._id == wikiPageHistory._id) break;
     }
     return historicalText;
};

