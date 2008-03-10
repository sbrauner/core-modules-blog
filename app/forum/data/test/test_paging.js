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

var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
var p = new Paging(data, {pageSize: 2, page: 1, padding: 0, minWindow: 0});
var w = p.getWindow();
assert(w.getFirstPage() == 1);
assert(w.getLastPage() == 1);

var p = new Paging(data, {pageSize: 2, page: 1, padding: 2, minWindow: 5});
var w = p.getWindow();
assert(w.getFirstPage() == 1);
assert(w.getLastPage() == 5);

var p = new Paging(data, {pageSize: 2, page: 4, padding: 2, minWindow: 5});
var w = p.getWindow();
assert(w.getFirstPage() == 2);
assert(w.getLastPage() == 6);
