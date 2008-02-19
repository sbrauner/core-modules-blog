core.content.wikiparser();

// Test that the wiki parser doesn't eat spaces.

s = " http://manuals.rubyonrails.com exists ";

w = new content.WikiParser();
o = w.toHtml(s);
assert(o == " <a href=\"http://manuals.rubyonrails.com\">http://manuals.rubyonrails.com</a> exists \n");

s = "http://manuals.rubyonrails.com ";
o = w.toHtml(s);
assert(o == "<a href=\"http://manuals.rubyonrails.com\">http://manuals.rubyonrails.com</a> \n");
