const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var ip = require('ip');

app.get('/', function(req, res, next){
	res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'))

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