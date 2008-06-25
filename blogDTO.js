function BlogDTO() {
    this._user = null;
    this._recentPostArray = [];
    this._categoryArray = [];
    this._postArray = [];
    this._pageTitle = null;
    this._pages = [];
    this._dateFormat = "F";
    this._baseURL = "/blog";
    this._blockedIP = null;
    this._yourname = "";
    this._url = "";
    this._email = "";

    // optional config strings
    this._commentsOpenHeader = null;
    this._commentFormName = null;
    this._commentAuthor = null;
    this._commentEmail = null;
    this._commentURL = null;
    this._commentText = null;
    this._captchaMessage = null;

};

BlogDTO.prototype.setUser = function(name) {
	this._user = user;
}

BlogDTO.prototype.getUser = function() {
    return this._user;
}

BlogDTO.prototype.setCaptchaForm = function(r) {
    this._yourname = r.yourname;
    this._url = r.url;
    this._email = r.email;
    this._txt = r.txt;
}
BlogDTO.prototype.clearCaptchaForm = function() {
    this._yourname = "";
    this._url = "";
    this._email = "";
    this._txt = "";
}

BlogDTO.prototype.getYourname = function() {
    return this._yourname;
}
BlogDTO.prototype.getUrl = function() {
    return this._url;
}
BlogDTO.prototype.getEmail = function() {
    return this._email;
}
BlogDTO.prototype.getTxt = function() {
    return this._txt;
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

BlogDTO.prototype.setPages = function(pages) {
    this._pages = pages;
}

BlogDTO.prototype.getPages = function() {
    return this._pages;
}

BlogDTO.prototype.setDateFormat = function(format) {
    this._dateFormat = format;
}

BlogDTO.prototype.getDateFormat = function() {
    return this._dateFormat;
}

BlogDTO.prototype.setBaseURL = function(url) {
    this._baseURL = url;
}

BlogDTO.prototype.getBaseURL = function() {
    return this._baseURL;
}

BlogDTO.prototype.setBlockedIP = function(bool) {
    this._blockedIP = bool;
}

BlogDTO.prototype.getBlockedIP = function() {
    return this._blockedIP;
}

BlogDTO.prototype.setCommentsOpenHeader = function(bool) { this._commentsOpenHeader = bool; }
BlogDTO.prototype.getCommentsOpenHeader = function() { return this._commentsOpenHeader; }

BlogDTO.prototype.setCommentFormName = function(name) { this._commentFormName = name; }
BlogDTO.prototype.getCommentFormName = function() { return this._commentFormName; }

BlogDTO.prototype.setCommentAuthor = function(author) { this._commentAuthor = author; }
BlogDTO.prototype.getCommentAuthor = function() { return this._commentAuthor; }

BlogDTO.prototype.setCommentEmail = function(email) { this._commentEmail = email; }
BlogDTO.prototype.getCommentEmail = function() { return this._commentEmail; }

BlogDTO.prototype.setCommentURL = function(url) { this._commentURL = url; }
BlogDTO.prototype.getCommentURL = function() { return this._commentURL; }

BlogDTO.prototype.setCommentText = function(txt) { this._commentText = txt; }
BlogDTO.prototype.getCommentText = function() { return this._commentText; }

BlogDTO.prototype.setCaptchaMessage = function(msg) { this._captchaMessage = msg; }
BlogDTO.prototype.getCaptchaMessage = function() { return this._captchaMessage; }
