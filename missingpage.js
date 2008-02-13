
MissingPage = function (uri) {
    this.uri = uri || '';
    this.date = Date().roundHour();
};

if (db) {
    db.blog.missingpages.ensureIndex( { uri : 1 , date : 1 } );
}
