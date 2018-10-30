var userSql = {
	//read : 'SELECT * FROM User',
	read : function(tableName){
		return 'SELECT * FROM '+ tableName +''
	},
	//insert:'INSERT INTO `User` (userName) VALUES(?)', 

	insert: function(tableName, key, value){
		//console.log("INSERT INTO "+tableName+" ("+key+") VALUES ("+value+")")
		return "INSERT INTO "+tableName+" ("+key+") VALUES ("+value+")"
	}, 

    getUserById: function(tableName, key , value){
    	return "SELECT * FROM "+ tableName +" WHERE "+ key +" = "+ value
    },

    upDate : function(tableName, key , value, id){
    	return "UPDATE "+ tableName +" SET "+ key +" = "+ value +" WHERE id = "+ id +""
    }

};

module.exports = userSql;