core.content.html();

var cases = [["Hello&ladies!", "Hello&amp;ladies!"],
             ["5 < 7", "5 &lt; 7"],
             ["std::vector<int> v;", "std::vector&lt;int&gt; v;"]]

for(var i in cases){
    assert(content.HTML.escape_html(cases[i][0]) == cases[i][1]);
    assert(cases[i][0] == content.HTML.unescape_html(cases[i][1]));
}
