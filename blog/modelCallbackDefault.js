
return { sidebar : [ { title: "Recent Posts", posts: blogUtils.getRecentPosts(5) },
                      { title: "Categories", include : "categories" },
                      { title: "Most Popular", posts: Post.getMostPopular(5, 100) },
                      { title: "Most Commented", posts: Post.getMostCommented(5, 100) },
                      { title: "Pages", posts: blogUtils.getPages() }
                    ] 
};

