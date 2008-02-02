
MissingPage = function (name) {
    this.uri = uri || '';
    this.date = new Date();
};

if (db) {
    db.blog.missingpages.ensureIndex( { uri : 1 } );
}
