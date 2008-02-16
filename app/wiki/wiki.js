app.wiki.WikiController = function() {};

app.wiki.WikiController.TEXT_PARSER = content.WikiParser;

app.wiki.WikiController.renamePage = function(wikiPage, newPageName) {
    // ensure we have a page
    if (!wikiPage) return false;
    if (app.wiki.config.readOnly) return false;
    
    // ensure our newPageName is valid
    if (!validatePageName(newPageName)) return false;

    // ensure we don't have a page with the new name already
    if (db.wiki.findOne( { name: newPageName } )) {
        SYSOUT("Can't rename page to " + newPageName + " since a page with that name already exists.");
        return false;
    } else { 
        wikiPage.name = newPageName;
        db.wiki.save(wikiPage);
        response.setResponseCode( 302 );
        response.setHeader("Location", wikiPage.name);
    }
};

app.wiki.WikiController.validatePageName = function(pageName) {
    // pageName can't be null or empty
    if (!pageName) return false;
    
    // pageName can't be empty
    pageName = pageName.trim();
    if (pageName == '') return false;
     
    // pageName can't be 'Main'
    if (pageName == 'Main') return false;
    else return true;
};

app.wiki.WikiController.deletePage = function(wikiPage) {
    SYSOUT('in delete');
    if (!wikiPage) return false;
    if (app.wiki.config.readOnly) return false;

    // ensure we're not trying to delete the Main page
    if (wikiPage.name == 'Main') {
        SYSOUT("Can't delete page Main");
        return false;
    }
    
    // ensure that the page is resident in the database
    if (!db.wiki.findOne( { name: wikiPage.name } )) {
        SYSOUT("Can't delete page because it hasn't been saved yet: " + wikiPage.name);
        return false
    }
    
    db.wiki.remove(wikiPage);
    response.setResponseCode(302);
     // for ourselves to requery to make sure it is gone, and to get out of "POST" mode
    response.setHeader("Location", wikiPage.name);
};

app.wiki.WikiController.updatePage = function(wikiPage, text) {
    if (!wikiPage) return false;
    if (!text || text.length == 0) return false;
    if (app.wiki.config.readOnly) return false;

    wikiPage.text = text;
    db.wiki.save(wikiPage);
};

app.wiki.WikiController.getCookieCrumb = function(wikiPage) {
    if (!wikiPage) return '';
    
    var cookieCrumb = '';
    var structuredName = wikiPage.getStructuredName();

    if (structuredName.length <= 1 ) return structuredName[0];

    // iterate through each name element and build up the rendered name
    var parentName = '';
    for (i = 0; i < structuredName.length; i++) {
        if (i == 0) parentName = structuredName[i];
        else parentName += '.' + structuredName[i];
        
        if (i > 0) cookieCrumb += '.';
        if (i == structuredName.length - 1) cookieCrumb += structuredName[i];
        else cookieCrumb += '<a href="' + parentName + '">' + structuredName[i] + '</a>';
    }
    
    return cookieCrumb;
}

app.wiki.WikiController.getChildPageNames = function(wikiPage) {
    if (!wikiPage) return [];
    
    var pageNameRegularExpression = /^[^.]*$/;
    if (wikiPage.name != app.wiki.config.prefix + "Main") pageNameRegularExpression = RegExp("^" + wikiPage.name + "\.[^.]+$");
    else if (app.wiki.config.prefix) pageNameRegularExpression = RegExp("^" + app.wiki.config.prefix + "\.[^.]+$");

    var childPages = db.wiki.find( { name: pageNameRegularExpression }, { name: true } ).sort( { name: 1 } ).toArray();

    childPages.forEach( function(childPage) {
        childPage.name = childPage.name.replace(new RegExp('^' + app.wiki.config.prefix), '');
    });
    
    return childPages;

    // remove the prefix from all of the names
    var prefixRegularExpression = null;
    if (app.wiki.config.prefix) {
        var s = app.wiki.config.prefix.replace(/\./g, '\.');
        prefixRegularExpression = RegExp(s);
    }
}