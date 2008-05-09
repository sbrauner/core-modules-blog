
Rails.View = {};

var myContentCache = {};

ActionController.Base.prototype.content_for = function( name , func ){
    myContentCache[name] = func.apply( this );
};
