
MissingPage = function (uri) {
    this.uri = uri || '';
    this.date = new Date().roundHour();
};

if (db) {
    db.blog.missingpages.ensureIndex( { uri : 1 , date : 1 } );
}
