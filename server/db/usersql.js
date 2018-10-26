var userSql = {
	read : 'SELECT * FROM User',
	insert:'INSERT INTO `User` (userName) VALUES(?)', 
    queryAll:'SELECT * FROM User',  
    getUserById:'SELECT * FROM User WHERE id = ? '
};

module.exports = userSql;