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

/* 
   import users from a moveable type database
*/

var db = connect( "alleyinsider" );
var jdbcDB = jdbc( "mysql://www.alleyinsider.com/alleyinsider_mt" , "dev" , "dv12" );

core.user.user();

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

var res = jdbcDB.query( "SELECT * FROM mt_author" );

while ( res.hasNext() ) {

    var u = new User();
    u.email = res.author_email;
    
    if( !u.email ) {
	print("blank email? " + res.author_id);
	continue;
    }

    var exist = db.users.findOne( u );
    if( exist ) {
	print("updating existing:");
	u = exist;
    }

    u.url = res.author_url;
    u.name = res.author_name;
    u.nickname = res.author_nickname;

    u.mt_author_id = res.author_id;
    u.mt_api_password = res.author_api_password;
    u.mt_password = res.author_password;
    u.mt_status = res.author_status;

    u.setPassword( "foo17" );

    var permRes = jdbcDB.query( "SELECT permission_permissions FROM mt_permission WHERE permission_author_id =  "  + res.author_id );
    while( permRes.hasNext() ){
        permRes["permission_permissions"].split( /,/ ).forEach(  function( z ){
                z = z.replace( /[ ,'']/g , "" ); 
                u.addPermission( z );
                
                if ( z == "administer" )
                    u.addPermission( "admin" );

            } );

        
    }

    print( u.email );
    print( "\t" + u.permissions );
    //print( tojson( u ) );
    
    db.users.save( u );

}

print("done updating db.users");
