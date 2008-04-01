log.app.forum.info("Running forum._init");

app.Forum = {
    renderer: (allowModule && allowModule.forum && allowModule.forum.renderer) || core.app.forum.html,
};

core.app.forum.html.form();
core.ext.getlist();
core.user.auth();
core.app.forum.controller();
core.app.forum.data.thread();
core.app.forum.data.topic();
core.content.search();
core.content.html();

// routes for forum
core.core.routes();
app.Forum.routes = new Routes();
var urls = ['editorPick', 'edpick_rss', 'index', 'moveThread', 'post_new',
    'post_split', 'search', 'sitemap', 'thread_action', 'thread_new',
    'thread_rss', 'topic_action', 'topic_edit', 'topic_hide', 'topic_move',
    'topic_new', 'topic_order', 'topic_rss', 'user_edit', 'viewthread',
    'viewtopic'];


app.Forum.defaultRoot = "/~~/app/forum";
for(var i = 0; i < urls.length; i++){
    app.Forum.routes[urls[i]] = app.Forum.defaultRoot + '/' + urls[i];
}

app.Forum.routes.setDefault("index", null);

app.Forum.routes.css = new Routes();

var cssfiles = ['forum.css', 'lock-icon.gif', 'sticky-icon.gif', 'th_arrow2.gif',
    'th_arrow.gif', 'th_back.gif', 'Thumbsup-icon.gif'];

for(var i = 0; i < cssfiles.length; i++){
    app.Forum.routes.css[cssfiles[i]] = app.Forum.defaultRoot + '/css/' + cssfiles[i];
}

app.Forum.routes.js = new Routes();

var jsfiles = ['yui'];

for(var i = 0; i < jsfiles.length; i++){
    app.Forum.routes.js[jsfiles[i]] = app.Forum.defaultRoot + '/js/' + jsfiles[i];
}

app.Forum.routes.images = new Routes();

var images = ['feed-icon16x16.png'];

for(var i = 0; i < images.length; i++){
    app.Forum.routes.images[images[i]] = app.Forum.defaultRoot + '/images/' + images[i];
}

