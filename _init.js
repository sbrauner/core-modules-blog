
htmlheader = function(title) {
    if(request.notice){
        addToNotice("request", request.notice);
    }

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

core.content.html();

addToNotice = function(key, value){
    // FIXME: This is a XSS attack waiting to happen.
    // Want us to show some code? Just link to a URL like
    // /?notice=<script>...</script>
        // This is a problem and I'd really like to fix it but
    // I don't know how. Right now login system uses this;
    // the form handler redirects to a different page, possibly
    // with a notice. The only way to handle this is by passing
    // something through the URL. We really need something like
    // Rails's Flash object.
    // Maybe if we had a routes system, we could just call the target
    // of whatever URL it was, rather than redirect.. but right now
    // we can't.
    if(! notice){
        notice = {};
    }

    // Try to prevent XSS, at least.
    value = content.HTML.escape(value);
    notice[key] = value;
};
