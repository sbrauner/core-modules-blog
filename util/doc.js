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

Util.Doc.DbToHTML = function(out_dir) {
    var d = db.doc.find();
    while(d.hasNext()) {
        this.DbObjToHTML(d.next(), out_dir);
    }
}

Util.Doc.DbObjToHTML = function(obj, out_dir) {
    javaStatic("ed.doc.Generate", "toHTML", tojson(obj._index), out_dir);
}
