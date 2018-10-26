const express = require('express');
const router = express.Router();
const mysql  = require('mysql');
const DBconfig = require('../db/DBConfig');
const userSQL = require('../db/usersql');
const snowflake = require('node-snowflake').Snowflake;
const pool = mysql.createConnection( DBconfig.mysql );
const utilError = require('../util/util');



//增
var ids = snowflake.nextId();
router.post("/addUser", (req, res) => {
	var param = req.query || req.params;
	let username = req.body.userName;
	var insert = "INSERT INTO `User` (userName, id) VALUES ('" + username + "', '"+ ids +"')";
	pool.query(insert, function (err, result) {
        if (err) {
        	return res.status(500).send(err);
    	};
		if(username){
	        req.session.regenerate(function(err) {
	            if(err){
	                return res.json(
	                	{
						    "status": 2,
						    "message": "登陆失败"
						}
                	);
	            }
	            req.session.loginUser = username;
	            res.cookie("chat-name", username, {
			      "httpOnly": true
			    });
			    res.cookie("chat-id", ids, {
			      "httpOnly": true
			    });
	            res.json(
	            		{
						    "status": 0,
						    "message": "登陆成功",
						    "info" : {
						    	"id" : ids,
						    	"userName" : username
						    }
						}
	            	);                           
	        });
	    }else{
	        res.json(
        		{
				    "status": 1,
				    "message": "账号错误"
				}
        	);
	    }
    })
});

//查
router.get('/getUserInfo/:userId', function(req, res){
	var id = req.params.userId;
	var getUser = "SELECT * FROM `User` WHERE id = "+ id;
	//console.log(getUser);
	pool.query(getUser, function (err, result) {
		utilError.jsonWrite(res, result);
	})
});

module.exports = router;