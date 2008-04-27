

link_to = function( pretty ){
    return "<a href='#'>" + pretty + "(broken)</a>";
};

error_messages_for = function( what ){
    return "(this should be error messages for: " + what + ")<br>";
};

form_for = function( what , frm ){
    print( "[" + Todo.prototype.keySet() + "]" );
    print( "form for : " + what + "(" + (typeof what) + ")" + "<BR>" );
    frm( new Todo() );
    //print( "form : " + arguments[0] + "<BR>" );
};

edit_person_path = function(){
  return "broken";
};




