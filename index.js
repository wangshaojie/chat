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


let clients = 0;
io.on('connection', function(socket){
	clients ++;
	//io.emit() 将消息发送给每个用户
	//socket.braodcast.emit() 将消息发送给除特别socket外的用户
	let data = {};
	data.description = clients + ' 人在线!';
	data.ip = ip.address();
	io.sockets.emit('userCount', data);
	socket.on('disconnect', function(){
		clients --;
		io.sockets.emit("userCount", { description: clients + ' 人离线!'})
	})

 	//为了简单起见，将消息发送给所有用户，包括发送者可以这么写 事件自定义
	socket.on('chat message', function(msg){
		let data = {};
		data.msg = msg;
		io.emit('chat message', data)

		// let readId = SELECT * FROM User WHERE id = id;
		// console.log(readId)
		//console.log("message:" + data.msg)
	});
})

http.listen(3000, function(){
	console.log("listening on : 3000" + " IP:" +ip.address())
});