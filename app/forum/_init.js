app.Forum = {
    renderer: (allowModule && allowModule.forum && allowModule.forum.renderer) || core.app.forum.html,
};

core.app.forum.html.form();
core.ext.getlist();
