core.content.htmlbuilder();

s = "<a style=\"mylink\">Click here</a>";
h = new HTMLBuilder.a({style: "mylink"}).add("Click here");

assert(s == h.toString());

hb = HTMLBuilder;
s = '<form><input type="hidden" name="select" value="someID"/><input type="hidden" name="action" value="sticky"/><input type="submit" value="go"/></form>';
h = new hb.form()
.add(new hb.input({type: 'hidden', name: 'select', value: 'someID'}))
.add(new hb.input({type: 'hidden', name: 'action', value: 'sticky'}))
.add(new hb.input({type: 'submit', value: 'go'}));

assert(s == h.toString());

s = '<form><a>text</a></form>';
h = new hb.form().add(new hb.a().add("text"));

assert(s == h.toString());

exit();
