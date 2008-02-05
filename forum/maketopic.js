<%
core.forum.forum();
core.content.forms();
if ( jxp.pieces && jxp.pieces.header ){ jxp.pieces.header(); }

var forum = new Forum.Forum();
Forms.fillInObject( "f", forum );
print.setFormObject( forum );
if(request.fname){
    forum.order = parseInt(forum.order);
    db.forum.forums.save(forum);
}
%>
    <h3>Make a new forum</h3>
    <form>
      Name: <input type="text" name="fname"><br/>
      Description: <input type="text" name="fdescription"><br/>
      Order: <input type="text" name="forder"><br/>
      <input type="submit" value="save">
    </form>
    <a href="./">Back to toplevel</a>

<%
if ( jxp.pieces && jxp.pieces.footer ){ jxp.pieces.footer(); }
%>
