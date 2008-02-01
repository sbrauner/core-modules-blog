if (! Forum) {
    Forum = {};
    Forum = {
	renderer: (allowModule && allowModule.forum && allowModule.forum.renderer) || core.forum.html,
    };
}
