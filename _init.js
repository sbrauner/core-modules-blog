
htmlheader = function(title) {
    title = title || '10gen Application';
    
    if ( useHeader )
        return useHeader( { title : title } );

    if ( jxp.pieces && jxp.pieces.header ) 
        return jxp.pieces.header( { title: title } );
    
    print('<html><head><title>' + title + '</title></head><body>');
}

htmlfooter = function() {
    if ( useFooter ) 
        return useFooter();
    
    if ( jxp.pieces && jxp.pieces.footer )
        return jxp.pieces.footer();
    
    print('</body></html>');
}
