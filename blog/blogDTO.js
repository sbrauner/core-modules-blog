function BlogDTO() {
	this._user = null;
	this._recentPostArray = [];
	this._categoryArray = [];
	this._postArray = [];
	this._pageTitle = "";
	this._dateFormat = "F";
};

BlogDTO.prototype.setUser = function(name) {
	this._user = user;
}

BlogDTO.prototype.getUser = function() {
    return this._user;
}

BlogDTO.prototype.setRecentPosts = function(postArr) {
    this._recentPostArray = postArr;
}

BlogDTO.prototype.getRecentPosts = function() {
	return this._recentPostArray;
}

BlogDTO.prototype.setCategories = function(catArr) {
    this._categoryArray = catArr;
}

BlogDTO.prototype.getCategories = function() {
    return this._categoryArray;
}

BlogDTO.prototype.setPost = function(post) {
	this._postArray[0] = post;
}

BlogDTO.prototype.getPost = function() {
    return this._postArray[0];
}

BlogDTO.prototype.getPostArray = function() {
    return this._postArray;
}

BlogDTO.prototype.setPostArray = function(postArray) {
    this._postArray = postArray;
}

BlogDTO.prototype.setPageTitle = function(title) {
	this._pageTitle = title;
}

BlogDTO.prototype.getPageTitle = function() {
    return this._pageTitle;
}

BlogDTO.prototype.setDateFormat = function(format) {
    this._dateFormat = format;
}

BlogDTO.prototype.getDateFormat = function() {
    return this._dateFormat;
}
