
return { sidebar : [ { title: "recent posts", posts: blogUtils.getRecentPosts(5) },
                      { title: "categories", include : "categories" },
                      { title: "most popular", posts: Post.getMostPopular(5, 100) },
                      { title: "most commented", posts: Post.getMostCommented(5, 100) },
                      { title: "pages", posts: blogUtils.getPages() }
                    ] 
};

