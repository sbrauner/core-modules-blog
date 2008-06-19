
if(request.newdoc) {
    if(request.js)
        javaStatic("ed.doc.Generate", "toDB", request.js);
    else if(request.java)
        javaStatic("ed.doc.Generate", "toDB", request.java);
    else
        return;
}
else if(request.regen) {
    var d = db.doc.find();
    while(d.hasNext()) {
        var cls = d.next();
        javaStatic("ed.doc.Generate", "toHTML", tojson(cls._index));
    }
}
