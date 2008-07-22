
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

Category = function (name, label) {
    this.name = name || '';
    this.label = label || ''; 
    this.description = '';
    
    this.label = this.label.toLowerCase();
};

Category.prototype.getLabel = function(){
    return this.label || this.name;
};

Category.getLabel = function( name ) {
    var category = db.blog.categories.findOne( {name: name } );
    if ( category ) 
        return category.getLabel()
    return "";
};

Category.find = function( name ){
    var tab = db.blog.categories;

    var c = tab.findOne( { name : name } );
    if ( c )
	return c;
    
    c = tab.findOne( { label : name } );
    if ( c )
	return c;

    c = tab.findOne( { name : new RegExp( "^" + name + "$" ) } );
    if ( c )
	return c;

    c = tab.findOne( { label : new RegExp( "^" + name + "$" ) } );
    if ( c )
	return c;
    
    return null;
};

if (db) {
    db.blog.categories.ensureIndex( { mt_id : 1 } );
    db.blog.categories.ensureIndex( { name : 1 } );
    
    db.blog.categories.setConstructor( Category );
}
