core.app.forum.data.paging();

var Paging = app.Forum.data.Paging;

var p = new Paging([1, 2, 3, 4, 5], {pageSize: 2, page: 2});

assert(p.numPages() == 3);
slice = p.slice();
assert(slice[0] == 5);
assert(slice.length == 1);



