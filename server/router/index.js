const express = require('express');
const router = express.Router();
const mysql  = require('mysql');
const DBconfig = require('../db/DBConfig');
const utilSQL = require('../db/usersql');
const jwt = require('jsonwebtoken');
const session = require('express-session');


//假的登陆验证
router.use("*", function (req, res, next) {
    let userInfo = {};
    if (req.cookies["chat-id"]) {
        userInfo.name = req.cookies["chat-name"];
        userInfo.id = req.cookies["chat-id"];
    }
    res.locals.userInfo = userInfo;
    next();
});

router.get("/join", (req, res) => {
	res.render('join');
});



router.param("userId",function(req,res,next,id){
  	res.locals.userId = id;
  	next();
});


// 使用DBConfig.js的配置信息创建一个MySQL连接池
var pool = mysql.createConnection( DBconfig.mysql );

router.get("/:userId", (req, res, next) => {
	pool.query(utilSQL.read('User'), function(err, result){
		var userInfo = res.locals.userInfo;
		var result = result.reverse();
		if(err){
			console.log('[SELECT ERROR] - ',err.message);
          	return;
		}
		res.render('index', {
	    	title : "聊天室",
	    	result : userInfo
	    });
	});
});






module.exports = router;