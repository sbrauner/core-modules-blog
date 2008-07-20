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
    this._commentError = "Captcha incorrect."
}
BlogDTO.prototype.clearCaptchaForm = function() {
    this._yourname = "";
    this._url = "";
    this._email = "";
    this._txt = "";
    this._commentError = "";
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
BlogDTO.prototype.getCommentError = function() {
    return this._commentError;
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

BlogDTO.prototype.setSearch = function(s){ this._search = s; }
BlogDTO.prototype.getSearch = function() { return this._search; }
