/* mysql php 

*/

/*
Mysql = function() {  };

Mysql.prototype.registerDatabase(host, user, pass, database = '_default') {
}
	
Mysql.prototype.setVersion(version) {
}

	/**
	 * Get a connection to a database, by name.
	 *
	 * @param string $database
	 * @return resource mysql link identifier
	 */
Mysql.prototype.getConnection(database) {
    return null;
}
	
	function query(connection, sql) {
	    if (defined('ORMADA_DEBUG')) { echo("[" + sql + "]<br />"); }
	    result = mysql_query(sql, connection);
	    if (!result) {
	        this.error(mysql_error() + " on ["+sql+"]");
	        return false;
	    }
	    return result;
	}

	function queryNoResult(connection, sql) {
	    if (defined('ORMADA_DEBUG')) { echo("[" + sql + "]<br />"); }
	    result = mysql_query(sql, connection);
	    if (mysql_query()) {
	        this.error(mysql_error() + " on ["+sql+"]");
	        return false;
	    }
	    return result;
	}
	
	function getOne(connection, sql) {
	    result = this.query(connection, sql);
	    row = mysql_fetch_row(result);
	    return row[0];
	}
	
	function getRow(connection, sql) {
	    result = this.query(connection, sql);
	    if (mysql_num_rows(result) <= 0) {
	        return [];
	    }
	    return mysql_fetch_assoc(result);
	}
	
	function getCol(connection, sql) {
	    result = this.query(connection, sql);
	    col = [];
	    while (row = mysql_fetch_row(result)) {
	        col[] = row[0];
	    }
	    return col;
	}
	
	/* Deprecated - use queryAssoc */
	function getAll(connection, sql) {
	    result = this.query(connection, sql);
	    rows = [];
	    while (row = mysql_fetch_assoc(result)) {
	        rows[] = row;
	    }
	    return rows;
	}
	
	/* Query Inline runs an sql statement but does not return a result set.  */
	function queryInline(sql, options = null) {
	    database = (isset(options['database'])) ? options['database'] : '_default';
	    
	    if (is_string(database)){
		connection =& this.getConnection(database);
	    }else{
		connection = & database;
	    }
	    result = this.query(connection, sql);
	}
	
	function queryAssoc(sql, options = null) {
	    
	    database = (isset(options['database'])) ? options['database'] : '_default';
	    
	    if (is_string(database)){
		connection =& this.getConnection(database);
	    }else{
		connection = & database;
	    }
		
	    result = this.query(connection, sql);
	    rows = [];
	    while (row = mysql_fetch_assoc(result)) {
	        rows[] = row;
	    }
	    return rows;
	}
	
	
	function fetchAssoc(connection, sql) {
	    result = this.query(connection, sql);
	    
	    assoc = [];
	    while (row = mysql_fetch_row(result)) {
	        assoc[row[0]] = row[1];
	    }
	    return assoc;
	}
	
	function &selectSQL(&connection, class_name, sql) {
		object =& new class_name;
		object_array = [];

		result = this.query(connection, sql);

		while (data = mysql_fetch_assoc(result)) {
			// allow for polymorphic subclasses based on the data (e.g. a 'type' field)
			new_class_name = object.getClass(data);
			object =& new new_class_name;
			object._data = data;
			object_array[] =& object;
		}

		return object_array;
	}
	
	function getInsertId(connection) {
	    return mysql_insert_id(connection);
	}
	
	function escape(connection, value) {
	    return mysql_real_escape_string(value, connection);
	}
	
	
	function &find(class_name, options = []) {
	    object =& new class_name;
	    
	    find_database = object.getSQLDatabase();
	    find_table = object.getSQLTable();
	    connection =& this.getConnection(find_database);
	    
	    join_classes = {find_table : class_name};
	    select_sql = "`"+find_table+"`.*";
	    from_sql = find_table;
	    set_related = [];
	    if (isset(options['related'])) {
    	    this.setupFindJoins(object, options['related'], select_sql, from_sql, join_classes, set_related, options);
	    }
	    
	    where_sql = isset(options['where']) ? " WHERE " + this.getWhere(options['where'], connection) : " WHERE 1";
	    order_sql = isset(options['order']) ? " ORDER BY " + options['order'] : false;
	    order_sql = !order_sql && object.getSQLOrder() ? " ORDER BY "+find_table+"." + object.getSQLOrder() : order_sql;
	    group_sql = isset(options['group']) ? " GROUP BY " + options['group'] : ''; // for "olinsky optimization"!! 11/30/2006
	    
	    limit_sql = isset(options['limit']) ? " LIMIT " + options['limit'] : '';
	    
	    if (isset(options['search'])) {
	        if (isset(options['search_fields'])) {
    	        text_fields = options['search_fields'];
    	    } else {
    	        text_fields = [];
    	        foreachkv(join_classes , function(table,$class) {
    	            obj =& new $class;
    	            fields = obj.getFieldTypes();
    	            if (is_array(fields)) {
        	            foreachkv(fields , function(field,type) {
        	                switch (strtolower(type)) {
        	                    case 'xhtml':
        	                    case 'text':
        	                    case 'email':
        	                        text_fields[] = table + "." + field;
        	                        breakForEach();
        	                }
        	            } );
        	        }
    	        } );
    	    }
	        if (count(text_fields)) {
	           search_type = isset(options['search_type']) ? options['search_type'] : 'or';
                query = this.escape(connection, options['search']);
	           if (search_type == 'concat') {
                    concat = implode(", ' ',", text_fields);
                    where_sql += " AND CONCAT("+concat+") LIKE '%"+query+"%'";
	           } else if (search_type == 'fulltext') {
                    where_sql += " AND MATCH(" + implode(",", text_fields) + ") AGAINST ('"+query+"')";
	           } else {
	               foreach(text_fields , function(field) {
	                   ors[] = ""+field+" LIKE '%"+query+"%'";
	               } );
	               where_sql += " AND (" + implode(" OR ", ors) + ")";
	           }
            } else {
                this.error("No searchable fields defined -- write getFieldTypes() on data object class");
            }
	    }
	    
	    // support 'assoc' option to return associative array rather than objects
	    if (isset(options['assoc'])) {
	        keys = array_keys(options['assoc']);
	        assoc_key = keys[0];
	        assoc_value = options['assoc'][assoc_key];
    	    select_sql = ""+assoc_key+", "+assoc_value;
    	    sql = "SELECT "+select_sql+" FROM "+from_sql+where_sql+group_sql+order_sql+limit_sql;
    	    results = this.fetchAssoc(connection, sql);
    	    return results;
	    }
	    
	    // $primary_keys tells us what the primary keys are of each table we're selecting
	    primary_keys = [];
	    foreachkv(join_classes , function(table,$class) {
	        sample_objects[table] =& new $class;
	        primary_keys[table] = sample_objects[table].getSQLPrimaryKey();
	    } );
	    
	    select_sql = isset(options['select']) ? options['select'] : select_sql;
	    from_sql = isset(options['from']) && options['from'] ? options['from'] : from_sql;
	    distinct = isset(options['distinct']) || isset(options['distinct_one']) ? 'DISTINCT ' : '';
	    sql = "SELECT "+distinct+select_sql+" FROM "+from_sql+where_sql+group_sql+order_sql+limit_sql;
	    if (isset(options['sql'])) {
	        sql = options['sql'];
	    }
	    
	    if (isset(options['with_count']) || isset(options['count'])) {
	        if (distinct) {
	            if (is_array(primary_keys[find_table])) {
	                keys = [];
	                foreach(primary_keys[find_table] , function(key) {
	                    keys[] = ""+find_table+"."+key;
	                } );
	                keys = implode(',', keys);
            	    count_sql = "SELECT COUNT("+distinct+keys+") FROM "+from_sql+where_sql;
	            } else {
            	    count_sql = "SELECT COUNT("+distinct+find_table+".{"+primary_keys+"["+find_table+"]}) FROM "+from_sql+where_sql;
	            }
	        } else {
	            count_sql = "SELECT COUNT(*) FROM "+from_sql+where_sql;
	        }
	    }
	    if (isset(options['count'])) {
	        result = this.query(connection, count_sql);
	        row = mysql_fetch_row(result);
	        return row[0];
	    }
	    result = this.query(connection, sql);
	    
	    // $loaded_objects tracks all the objects we have loaded, by table
	    loaded_objects = [];
	    
	    result_objects = [];
	    
	    field_count = mysql_num_fields(result);
	    while (row = mysql_fetch_row(result)) {
	        data = [];
	        objects = [];
	        for (i = 0; i < field_count; i++) {
	            data[mysql_field_table(result, i)][mysql_field_name(result, i)] = row[i];
	        }
	        
	        foreachkv(data , function(table,table_data) {
	            
	            keys = primary_keys[table];
	            id = this.getFlattenedId(table_data, keys);
	            
	            if (id === null) {
	                // simply ignore it if it's a null entry
	            } else if (isset(loaded_objects[table][id])) {
	                objects[table] =& loaded_objects[table][id];
	            } else {
	                // allow for polymorphism based on a 'type' field
    	            new_class = sample_objects[table].getClass(table_data);
    	            objects[table] =& new new_class;
    	            objects[table]._data = table_data;
    	            loaded_objects[table][id] =& objects[table];
	            }
	        } );
	        
	        // add related links where we can
	        foreach(set_related , function(rel_data) {
	            list(action, to, from, from_relation) = rel_data;
	            if (isset(objects[from]) && isset(objects[to])) {
	                if (action == 'add') {
	                    objects[to]._related[from_relation][] =& objects[from];
	                } else {
	                    objects[to]._related[from_relation] =& objects[from];
	                }
	            }
	        } );
	    }
	    
	    $return = isset(options['return']) ? options['return'] : 'numeric';
	    
	    switch ($return) {
	        case 'pk_assoc':
	        case 'assoc':
	            if (isset(options['assoc_key'])) {
	                objects = [];
	                if (isset(loaded_objects[find_table])) {
    	                foreach(loaded_objects[find_table] , function(obj) {
    	                    objects[obj.get(options['assoc_key'])] = obj;
    	                } );
	                }
	            } else {
    	            objects =& loaded_objects[find_table];
	            }
	            break;
	        case 'numeric':
        	    objects = [];
        	    if (isset(loaded_objects[find_table])) {
        	        foreachkv(loaded_objects[find_table] , function(k,obj) {
        	            objects[] = obj;
        	        } );
        	    }
        	    break;
	        case 'one':
	            if (isset(loaded_objects[find_table]) && count(loaded_objects[find_table])) {
    	            keys = array_keys(loaded_objects[find_table]);
    	            objects =& loaded_objects[find_table][keys[0]];
	            } else {
	                objects = false;
	            }
	            break;
	    }
	    
	    if (isset(options['with_count'])) {
	        // optimization: don't bother recounting if there was no limit passed
	        if (!isset(options['limit'])) {
	            result = {'count' : sizeof(objects)};
	            result['objects'] = objects;
	            return result;
	        }
    	    result = this.query(connection, count_sql);
    	    list(count) = mysql_fetch_row(result);
    	    result = {'count' : count, 'objects' : objects};
    	    return result;
	    } else {
	        return objects;
	    }
	}
	
	function setupFindJoins(object, relation, &select_sql, &from_sql, &join_classes, &set_related, options = []) {
	    if (is_array(relation)) {
	        foreachkv(relation , function(k,v) {
	            if (is_numeric(k)) {
	                this.setupFindJoins(object, v, select_sql, from_sql, join_classes, set_related, options);
	            } else {
	                this.setupFindJoins(object, k, select_sql, from_sql, join_classes, set_related, options);
	                related = this.getRelationSchema(object, k);
	                // with the distinct_one option selected, do not perform selects on many-joins
	                if (isset(options['distinct_one']) && (related['type'] == '1:M' || related['type'] == 'M:M')) {
	                    options['no_select'] = true;
	                }
	                related_obj =& new related['class'];
	                this.setupFindJoins(related_obj, v, select_sql, from_sql, join_classes, set_related, options);
	            }
	        } );
	        return;
	    }
	    
	    related = this.getRelationSchema(object, relation);
	    if (isset(options['distinct_one']) && (related['type'] == '1:M' || related['type'] == 'M:M')) {
	        options['no_select'] = true;
	    }
	    
	    primary_key = object.getSQLPrimaryKey();
	    table = object.getSQLTable();
	    reverse_relation = table; // fix this
	    
        join_classes[related['table']] = related['class'];
        if (!isset(options['no_select'])) {
            select_sql += ", `{"+related+"['table']}`.*";
        }

        switch (related['type']) {
	        case '1:1':
	            this.error("Joins are not permitted on the '"+relation+"' relation");
	            return false;
	        
	        case 'M:1':
	            set_related[] = ['set', table, related['table'], relation];
	            set_related[] = ['add', related['table'], table, reverse_relation]; // ?
	            from_sql += " LEFT JOIN `{"+related+"['table']}` ON "+table+".{"+related+"['foreign_key']} = {"+related+"['table']}.{"+related+"['primary_key']}";
	            break;
	            
	        case '1:M':
	            set_related[] = ['set', related['table'], table, reverse_relation];
	            set_related[] = ['add', table, related['table'], relation];
	            from_sql += " LEFT JOIN {"+related+"['table']} ON "+table+"."+primary_key+" = {"+related+"['table']}.{"+related+"['foreign_key']}";
    	        break;
    	        
	        case 'M:M':
	            set_related[] = ['add', related['table'], table, reverse_relation];
	            set_related[] = ['add', table, related['table'], relation];
	            from_sql += " LEFT JOIN {"+related+"['join_table']} ON "+table+"."+primary_key+" = {"+related+"['join_table']}.{"+related+"['foreign_key']}
	                           LEFT JOIN {"+related+"['table']} ON {"+related+"['join_table']}.{"+related+"['other_foreign_key']} = {"+related+"['table']}.{"+related+"['other_primary_key']}";
	            break;
	    }
	}
	
	function getFlattenedId(data, keys) {
	    if (!is_array(keys)) {
	        return data[keys];
	    }
	    result = [];
	    foreach(keys , function(k) {
	        if (data[k] === null) {
	            return null;
	        }
	        result[] = data[k];
	    } );
	    return implode("/", result);
	}

	function getInsertUpdateSQL(&connection, database, table, data, created_field = false, modified_field = false) {
		fields = [];
		values = [];
		updates = [];
		
		if (created_field) {
		    unset(data[created_field]);
		}
		
		if (modified_field) {
		    unset(data[modified_field]);
		}
		
		foreachkv(data , function(field,value) {
			fields[] = field;
			if (value === null || value === false) {
			    val = 'NULL';
			} else {
    			val = "'" + this.escape(connection, value) + "'";
			}
			values[] = val;
			updates[] = ""+field+" = "+val;
		} );
		if (created_field) {
		    fields[] = created_field;
		    values[] = "NOW()";
		}
		if (modified_field) {
			fields[] = modified_field;
			values[] = "NOW()";
		    updates[] = ""+modified_field+" = NOW()";
		}
		fields = implode(',', fields);
		values = implode(',', values);
		updates = implode(',', updates);
		
		if (version_compare(this.version, '4.1') < 0) { 
    		return "REPLACE INTO "+database+"."+table+" ("+fields+") VALUES ("+values+")";
    	} else {
        	return "INSERT INTO "+database+"."+table+" ("+fields+") VALUES ("+values+") ON DUPLICATE KEY UPDATE "+updates;
    	}
	}

*/
%>
