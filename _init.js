
htmlheader = function(title) {
    title = title || '10gen Application';
    if (jxp.pieces && jxp.pieces.header) jxp.pieces.header({title: title});
    else return '<html><head><title>' + title + '</title></head><body>';
}

htmlfooter = function() {
    if (jxp.pieces && jxp.pieces.footer) jxp.pieces.footer();
    else return '</body></html>';
}