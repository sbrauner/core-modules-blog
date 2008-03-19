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
