/* 
   import users from a moveable type database
 */

var db = connect( "alleyinsider" );
var jdbcDB = jdbc( "mysql://www.alleyinsider.com/alleyinsider_mt" , "dev" , "dv12" );

/*
> +-----------------------------+--------------+------+-----+---------+----------------+
> | Field                       | Type         | Null | Key | Default | Extra          |
> +-----------------------------+--------------+------+-----+---------+----------------+
>x| author_id                   | int(11)      |      | PRI | NULL    | auto_increment |
>x| author_api_password         | varchar(60)  | YES  |     | NULL    |                |
...
>x| author_email                | varchar(75)  | YES  | MUL | NULL    |                |
...
>x| author_name                 | varchar(255) |      | MUL |         |                |
>x| author_nickname             | varchar(255) | YES  |     | NULL    |                |
>x| author_password             | varchar(60)  |      |     |         |                |
...
>x| author_status               | int(11)      | YES  | MUL | 1       |                |
>x| author_url                  | varchar(255) | YES  |     | NULL    |                |
> +-----------------------------+--------------+------+-----+---------+----------------+
*/

var first = true;

var res = jdbcDB.query( "SELECT * FROM mt_author" );

while ( res.hasNext() ) {

    var u = { email: res.author_email };
    if( !u.email ) {
	print("blank email? " + res.author_id);
	continue;
    }

    var exist = db.users.findOne( u );
    if( exist ) {
	print("updating existing:");
	u = exist;
    }

    u.author_id = res.author_id;
    u.api_password = res.author_api_password;
    u.name = res.author_name;
    u.nickname = res.author_nickname;
    u.mt_password = res.author_password;
    u.mt_status = res.author_status;
    u.url = res.author_url;

    print( u.email );
    
    db.users.save( u );

    if( first ) { 
	first = false;
	db.users.ensureIndex( { email : 1 } );
    }
}

print("done updating db.users");
