const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ip = require('ip');
const bodyParser = require('body-parser');
const MongoClient = require('Mongodb').MongoClient;
const router = require(__dirname + '/server/router/index');
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

app.use('/', router);

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

//捕捉错误
app.use(function(req, res, next){
	console.log(err);
	next();
});


let clients = 0;
io.on('connection', function(socket){
	clients ++;
	//io.emit() 将消息发送给每个用户
	//socket.braodcast.emit() 将消息发送给除特别socket外的用户
	let data = {};
	data.description = clients + ' 人在线!';
	data.ip = ip.address();
	io.sockets.emit('broadcast', data);
	socket.on('disconnect', function(){
		clients --;
		io.sockets.emit("broadcast", { description: clients + ' 人离线!'})
	})
	// setTimeout(function() {
 //      socket.emit('testerEvent', { description: 'A custom event named testerEvent!'});
 //   }, 4000);

 	//为了简单起见，将消息发送给所有用户，包括发送者可以这么写 事件自定义
	socket.on('chat message', function(msg){
		let data = {};
		data.msg = msg;
		data.ip = ip.address();
		io.emit('chat message', data)
		console.log("message:" + data.msg)
	})
})

http.listen(3000, function(){
	console.log("listening on : 3000" + " IP:" +ip.address())
});