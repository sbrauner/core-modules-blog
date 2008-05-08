
Rails.View = {};

var myContentCache = {};

function content_for( name , func ){
    myContentCache[name] = func();
};
