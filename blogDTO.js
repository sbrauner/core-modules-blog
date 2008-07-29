/**
*      Copyright (C) 2008 10gen Inc.
*
*    Licensed under the Apache License, Version 2.0 (the "License");
*    you may not use this file except in compliance with the License.
*    You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*    Unless required by applicable law or agreed to in writing, software
*    distributed under the License is distributed on an "AS IS" BASIS,
*    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*    See the License for the specific language governing permissions and
*    limitations under the License.
*/

/** Initializes a new data transfer object for the blog, used extensively with the templates.
 * @constructor
 */
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
    this._commentError = "";
    this._search = "";
    this._currentPage = 1;
    this._numPages = 1;
    this._uri = "";

    // optional config strings
    this._commentsOpenHeader = null;
    this._commentFormName = null;
    this._commentAuthor = null;
    this._commentEmail = null;
    this._commentURL = null;
    this._commentText = null;

};

/** Sets the user using the global user object.
 */
BlogDTO.prototype.setUser = function(name) {
	this._user = user;
}

/** Returns the user.
 */
BlogDTO.prototype.getUser = function() {
    return this._user;
}

    BlogDTO.setUpPaging = function(r, pageSize) {
        pageSize = pageSize || 30;
    this._uri = r.getURI();
    page = this._uri.match(/\/page\/([0-9]*)$/);
    if(page) { // currentPage defaults to 1
        this._currentPage = parseInt(page[1]);
    }
    this._numPages = Math.ceil(db.blog.posts.find().count() / pageSize);
}

BlogDTO.prototype.isFirstPage = function() {
    return this._currentPage == 1;
}

BlogDTO.prototype.isLastPage = function() {
    return this._currentPage == this._numPages;
}

BlogDTO.prototype.getPrevPageLink = function() {
    return this._uri.replace(new RegExp("\\/page\\/"+this._currentPage), "/page/"+(this._currentPage-1));
}

BlogDTO.prototype.getNextPageLink = function() {
    if(this._uri.indexOf("/page/") == -1) {
        return this._uri + (this._uri.endsWith("/") ? "" : "/") + "page/2";
    }
    return this._uri.replace(new RegExp("\\/page\\/"+this._currentPage), "/page/"+(this._currentPage+1));
}

/** Fills out the comment fields given an unsuccessful HTTP request.
 * @param {HTTPRequest} r request from which to find arguments
 */
BlogDTO.prototype.setCaptchaForm = function(r) {
    this._yourname = r.yourname;
    this._url = r.url;
    this._email = r.email;
    this._txt = r.txt;
    this._commentError = "Captcha incorrect."; // FIXME: use commentError
}

/**
 * Clears the comment fields when a comment has been successfully submitted.
 */
BlogDTO.prototype.clearCaptchaForm = function() {
    this._yourname = "";
    this._url = "";
    this._email = "";
    this._txt = "";
    this._commentError = "";
}

/**
 * Returns the name of an unregistered user who submitted a comment.
 * @return {string} the name of the unregistered user
 */
BlogDTO.prototype.getYourname = function() {
    return this._yourname;
}

/**
 * Returns the website URL of an unregistered user who submitted a comment.
 * @return {string} the URL
 */
BlogDTO.prototype.getUrl = function() {
    return this._url;
}

/**
 * Returns the email address of an unregistered user who submitted a comment.
 * @return {string} the email address
 */
BlogDTO.prototype.getEmail = function() {
    return this._email;
}

/**
 * Returns the comment text of an unregistered user who submitted a comment.
 * @return {string} the comment
 */
BlogDTO.prototype.getTxt = function() {
    return this._txt;
}

/**
 * Returns either the empty string if a comment was successfully posted or a message stating that the comment was not successfully posted.
 * @return {string} the status of a comment
 */
BlogDTO.prototype.getCommentError = function() {
    return this._commentError;
}

/**
 * Sets the categories for a post.
 * @param {Array} catArr array of the post's categories
 */
BlogDTO.prototype.setCategories = function(catArr) {
    this._categoryArray = catArr;
}

/**
 * Returns the categories of a post.
 * @return {Array} the array of categories
 */
BlogDTO.prototype.getCategories = function() {
    return this._categoryArray;
}

/**
 * Sets the post to display.
 * @param {Post} post post to display
 */
BlogDTO.prototype.setPost = function(post) {
	this._postArray[0] = post;
}

/**
 * Returns the first (and possibly only) post to display.
 * @return {Post} a single post to display
 */
BlogDTO.prototype.getPost = function() {
    return this._postArray[0];
}

/** Returns an array of posts.
 * @return {Array} an array of posts
 */
BlogDTO.prototype.getPostArray = function() {
    return this._postArray;
}

/**
 * Sets the array of posts to be displayed.
 * @param {Array} postArray posts to be displayed.
 */
BlogDTO.prototype.setPostArray = function(postArray) {
    this._postArray = postArray;
}

/**
 * Sets the blog's title.  By default, this is not the text appearing between the &lt;title&gt; tags.
 * @param {string} title the title for the blog
 */
BlogDTO.prototype.setPageTitle = function(title) {
	this._pageTitle = title;
}

/**
 * Returns the blog's title.
 * @return {string} the blog's title
 */
BlogDTO.prototype.getPageTitle = function() {
    return this._pageTitle;
}

/**
 * Sets an array of pages.
 * @param {Array} pages an array of pages-type posts
 */
BlogDTO.prototype.setPages = function(pages) {
    this._pages = pages;
}

/**
 * Returns the array of pages.
 * @return {Array} the array of pages
 */
BlogDTO.prototype.getPages = function() {
    return this._pages;
}

/**
 * Sets a format for displaying dates within the blog.
 * @param {string} format format string, see JSDate documentation for options
 */
BlogDTO.prototype.setDateFormat = function(format) {
    this._dateFormat = format;
}

/**
 * Returns the blog's date format.
 * @return {string} the format to use for dates
 */
BlogDTO.prototype.getDateFormat = function() {
    return this._dateFormat;
}

/**
 * Sets the URL to which all blog-related pages will be suffixed
 * @param {string} url the URL
 */
BlogDTO.prototype.setBaseURL = function(url) {
    this._baseURL = url;
}

/**
 * Returns the base URL of the blog.
 * @return {string} the base URL
 */
BlogDTO.prototype.getBaseURL = function() {
    return this._baseURL;
}

/**
 * Sets a flag if the IP address is blocked.
 * @param {boolean} blocked if the address is blocked
 */
BlogDTO.prototype.setBlockedIP = function(bool) {
    this._blockedIP = bool;
}

/**
 * Returns if this IP address is blocked.
 * @return {boolean} if the IP address is blocked
 */
BlogDTO.prototype.getBlockedIP = function() {
    return this._blockedIP;
}

/**
 * Sets the comment's author.
 * @param {string} the author's name
 */
BlogDTO.prototype.setCommentAuthor = function(author) { this._commentAuthor = author; }

/**
 * Returns the comment's author.
 * @return {string} the author's name
 */
BlogDTO.prototype.getCommentAuthor = function() { return this._commentAuthor; }

/**
 * Sets the comment's author's email.
 * @param {string} the author's email
 */
BlogDTO.prototype.setCommentEmail = function(email) { this._commentEmail = email; }

/**
 * Returns the comment's author'semail.
 * @return {string} the author's email
 */
BlogDTO.prototype.getCommentEmail = function() { return this._commentEmail; }

/**
 * Sets the comment's author's website.
 * @param {string} the author's website
 */
BlogDTO.prototype.setCommentURL = function(url) { this._commentURL = url; }

/**
 * Returns the comment's author's website.
 * @return {string} the author's website
 */
BlogDTO.prototype.getCommentURL = function() { return this._commentURL; }

/**
 * Sets the comment's body text.
 * @param {string} the author's comment
 */
BlogDTO.prototype.setCommentText = function(txt) { this._commentText = txt; }

/**
 * Returns the comment's body text.
 * @return {string} the author's comment
 */
BlogDTO.prototype.getCommentText = function() { return this._commentText; }

/**
 * Sets the text for which a search is being executed.
 * @param {string} s the text for which to search
 */
BlogDTO.prototype.setSearch = function(s){ this._search = s; }

/**
 * Returns the search terms.
 * @return {string} the search string
 */
BlogDTO.prototype.getSearch = function() { return this._search; }
