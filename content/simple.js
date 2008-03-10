/** Simple text format processor, suitable for handling text from
 *  blog posts, etc.
*/

content.Simple = function(){

};

content.Simple.prototype.toHtml = function(str){
    str = str.replace(/\r?\n/g, '<br/>');
    return str;
};
