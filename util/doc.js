core.core.file();

Util.Doc = {};

Util.Doc.JSToDb = function(file) {
    this.toDb("../"+file, "JSToDb");
}

Util.Doc.JavadocToDb = function(file) {
    this.toDb("../"+file, "JavadocArgHelper");
}

Util.Doc.toDb = function(file, javaFunc) {
    javaStatic("ed.doc.Generate", javaFunc, file);
}

Util.Doc.DbToHTML = function() {
    var d = db.doc.find();
    while(d.hasNext()) {
        this.DbObjToHTML(d.next());
    }
}

Util.Doc.DbObjToHTML = function(obj) {
    javaStatic("ed.doc.Generate", "toHTML", tojson(obj._index));
}
