app.wiki = Object();

core.core.routes();

core.content.wikiparser();
core.content.htmlhelper();

core.html.html();

core.util.diff();

core.app.wiki.wiki();
core.app.wiki.wikipage();
core.app.wiki.wikipagehistory();


if (!(allowModule && allowModule.wiki)) {
    print("module error 1");
    return;
}

app.wiki.config = allowModule.wiki;
app.wiki.config.prefix = app.wiki.config.prefix || "";


app.wiki.routes = new Routes();
app.wiki.routes.search = "/~~/app/wiki/search";
app.wiki.routes.add( /.*\.(js|css|jpg|gif|jpeg|png|ico)$/ , "/~~/app/wiki/$0" ); 
app.wiki.routes.add( /\/?(.*)/ , "/~~/app/wiki" , { names : [ "name" ] } );


