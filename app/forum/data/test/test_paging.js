core.app.forum.data.paging();

var Paging = app.Forum.data.Paging;

var data = [1, 2, 3, 4, 5];

var p = new Paging(data, {pageSize: 2, page: 3});

assert(p.numPages() == 3);
slice = p.slice();
assert(slice[0] == 5);
assert(slice.length == 1);


var p = new Paging(data, {pageSize: 2, page: 3});
var w = p.getWindow();
assert(w.getFirstPage() == 1);
assert(w.getLastPage() == 3);

var p = new Paging(data, {pageSize: 2, page: 3, padding: 0, minWindow: 0});
var w = p.getWindow();
assert(w.getFirstPage() == 3);
assert(w.getLastPage() == 3);

