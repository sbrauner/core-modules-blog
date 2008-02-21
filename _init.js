
htmlheader = function(title) {
    title = title || '10gen Application';
    if (useHeader) useHeader();
    else if (jxp.pieces && jxp.pieces.header) jxp.pieces.header(title);
    else if (jxp.html && jxp.html.pieces && jxp.html.pieces.header) jxp.html.pieces.header(title);
    else print('<html><head><title>' + title + '</title></head><body>');
}

htmlfooter = function() {
    if (useFooter) useFooter();
    else if (jxp.html && jxp.html.pieces && jxp.html.pieces.footer) jxp.html.pieces.footer();
    else print('</body></html>');
}