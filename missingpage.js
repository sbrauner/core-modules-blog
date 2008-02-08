
MissingPage = function (uri) {
    this.uri = uri || '';
    this.date = new Date();
};

if (db) {
    db.blog.missingpages.ensureIndex( { uri : 1 } );
}
