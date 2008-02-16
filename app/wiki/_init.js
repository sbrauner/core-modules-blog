app.wiki = Object();

core.app.wiki.wikipage();
core.content.wikiparser();
core.content.htmlhelper();
core.html.html();

if (!(allowModule && allowModule.wiki)) {
    print("module error 1");
    return;
}

app.wiki.config = allowModule.wiki;
app.wiki.config.prefix = app.wiki.config.prefix || "";
