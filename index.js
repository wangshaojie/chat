const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ip = require('ip');
const bodyParser = require('body-parser');
const MongoClient = require('Mongodb').MongoClient;
const router = require(__dirname + '/server/router/index');
const apiRouter = require(__dirname + '/server/service/apiService');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysql  = require('mysql');
const DBconfig = require(__dirname + '/server/db/DBConfig');
const utilSQL = require(__dirname + '/server/db/usersql');
const pool = mysql.createConnection( DBconfig.mysql );
const snowflake = require('node-snowflake').Snowflake;



app.set('views', path.join(__dirname, 'server','views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.static('public'));
const identityKey = 'skey';

app.use(session({
    name: identityKey,
    secret: 'chyingp',  // 用来对session id相关的cookie进行签名
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24   //有效期一天
    }
}));


//登录拦截器，必须放在静态资源声明之后、路由导航之前
// app.use(function (req, res, next) {
//     var url = req.originalUrl;
//     console.log(req.session)
//     if (url != "/join" && !req.session.loginUser) {
//         return res.redirect("/join");
//     }
//     next();
// });

app.use('/', router);
app.use('/api', apiRouter);


let clientsNum = 0;
let onlineClients = [];  //在线用户
let publishTime = new Date();

io.on('connection', function(socket){
	var addedUser = false;
	var wsId = socket.id;
	clientsNum ++;
	//io.emit() 将消息发送给每个用户
	//socket.braodcast.emit() 将消息发送给除特别socket外的用户
	let data = {};
	data.description = clientsNum + ' 人在线!';
	data.ip = ip.address();
	io.sockets.emit('userCount', data);

	//查询聊天信息
	pool.query(utilSQL.read('message'), function(err, result){
		//console.log(result)
		io.sockets.emit('allChatInfo', result);
	});
	
	

 	//为了简单起见，将消息发送给所有用户，包括发送者可以这么写 事件自定义
	socket.on('chat message', function(message, name, userId){
		//console.log(onlineClients)
		let data = {};
		data.message = message;
		data.userName = name;
	
		//插入聊天信息
		pool.query(utilSQL.insert('message', 'userId, message, userName', " '"+ userId +"',  '"+ message +"', '"+ name +"' "), function (err, result) {
			//console.log(result)
			//console.log(err)
		});

		//插入socket表 关联socketid跟userid
		pool.query(utilSQL.insert('socket', 'userId, wsId', " '"+ userId +"',  '"+ wsId +"' "), function (err, result) {
			//console.log(result)
			//console.log(err)
		})
		io.emit('chat message', data)
	});

	//在线用户
	getUserData(socket);
	io.sockets.emit('onlineCliens', onlineClients);

	socket.on('add user', (username) => {
		socket.username = username;
	    socket.broadcast.emit('user joined', {
	      username: socket.username,
	      clientsNum: clientsNum
	    });
	});

	//断开连接
	socket.on('disconnect', function(){
		clientsNum --;
		onlineClients.splice(socket.userIndex, 1);
		io.sockets.emit("userCount", { description: clientsNum + ' 人离线!'})
		io.sockets.emit("system", { description: socket.username})
	});


})


const getUserData = function(socket){
	pool.query(utilSQL.read('User'), function(err, result){
		if(!result || result.length == 0) return;
		for (var i = 0; i < result.length; i++) {
			if(result[i].isOnline == 1){
				onlineClients.push(result[i]);
				socket.userIndex = onlineClients.length;
			}
		}			
	});
}

http.listen(3000, function(){
	console.log("listening on : 3000" + " IP:" + ip.address())
});