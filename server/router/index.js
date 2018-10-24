const express = require('express');
const router = express.Router();
const mysql  = require('mysql');
const DBconfig = require('../db/DBConfig');
const userSQL = require('../db/usersql');
const jwt = require('jsonwebtoken');



// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, ret) {
    if(typeof ret === 'undefined') {
        res.json({
            code:'1',
            msg: '操作失败'
        });
    } else {
        res.json(ret);
    }
};


// 使用DBConfig.js的配置信息创建一个MySQL连接池
var pool = mysql.createConnection( DBconfig.mysql );
router.all('/*', function(req, res, next){
	var cookies = req.headers.cookie;
	console.log(cookies)
	var url= req.originalUrl;
	//console.log(req)
	if(req.cookies && req.cookies.userName){
		if(url != "/"){
			res.redirect(301, "/");
		}
	}
	// else{
	// 	res.redirect(301, "/join");
	// 	
	// }
	next()
	
});

router.get("/", (req, res) => {
	pool.query(userSQL.read, function(err, result){
		if(err){
			console.log('[SELECT ERROR] - ',err.message);
          	return;
		}
		console.log(JSON.stringify(result))
		res.render('index', {
	    	title : "聊天室"
	    });
	});
});


router.get("/join", (req, res) => {
	res.render('join');
});


//增
router.post("/api/addUser", (req, res) => {
	var param = req.query || req.params;
	let username = req.body.userName;
	var insert = "INSERT INTO `User` (userName) VALUES ('" + username + "')";
	pool.query(insert,function (err, result) {
        if (err) {
        	return res.status(500).send(err);
    	};

		// Token 数据
		const payload = {
		  userName : username,
		  admin: true
		}

		// 密钥
		const secret = 'ILOVENINGHAO'

		// 签发 Token
		const token = jwt.sign(payload, secret, { expiresIn: '1day' })

		// 输出签发的 Token
		result.token = token;
		result.userName = username;

		res.cookie('userName', username);
		res.cookie('u_token', token);

    	//结果返回
        jsonWrite(res, result);
        //res.redirect('/');

    })
});



module.exports = router;