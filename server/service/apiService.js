const express = require('express');
const router = express.Router();
const mysql  = require('mysql');
const DBconfig = require('../db/DBConfig');
const utilSQL = require('../db/usersql');
const snowflake = require('node-snowflake').Snowflake;
const pool = mysql.createConnection( DBconfig.mysql );
const utilError = require('../util/util');


let userDefaultImgArr = 
['http://thyrsi.com/t6/400/1540794654x-1404817844.jpg',
'http://thyrsi.com/t6/400/1540794679x-1404817844.jpg',
'http://thyrsi.com/t6/400/1540794689x-1404817844.jpg',
'http://thyrsi.com/t6/400/1540794697x-1404817844.jpg',
'http://thyrsi.com/t6/400/1540794716x-1404817844.jpg',
'http://thyrsi.com/t6/400/1540794726x-1404817844.jpg',
'http://thyrsi.com/t6/400/1540794735x-1404817844.jpg'];

//增

var index = Math.floor((Math.random()*userDefaultImgArr.length));
router.post("/addUser", (req, res) => {
	var ids = snowflake.nextId();
	var param = req.query || req.params;
	let username = req.body.userName;
	var isOnline = 1; //1在线 0离线
	//var insert = "INSERT INTO `User` (userName, id, image) VALUES ('" + username + "', '"+ ids +"', '"+ userDefaultImgArr[index] +"')";
	pool.query(utilSQL.insert('User', 'userName, id, image, isOnline', " '"+ username +"',  '"+ ids +"',  '"+ userDefaultImgArr[index] +"', '"+ isOnline +"' "), function (err, result) {
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
	//console.log(getUser);
	pool.query(utilSQL.getUserById('User', 'id', " '"+ id +"' "), function (err, result) {
		utilError.jsonWrite(res, result);
	})
});

module.exports = router;