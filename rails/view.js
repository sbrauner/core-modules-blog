
Rails.View = {};

var myContentCache = {};

ActionController.Base.prototype.content_for = function( name , func ){
    this.debug();
    myContentCache[name] = func.apply( this );
};
