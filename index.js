const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ip = require('ip');
const bodyParser = require('body-parser');
const MongoClient = require('Mongodb').MongoClient;

var token = new Date().getTime();

//中间件 bodyParser.urlencoded 模块用于解析req.body的数据
//解析成功后覆盖原来的req.body，如果解析失败则为 {} 。
//该模块有一个属性extended，
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json())
app.use(express.static('public'));

var db = null;

var url = 'mongodb://superAdmin:abc123456@ds115798.mlab.com:15798/star_login';
const dbConfig = {
  
  autoIndex: false,
  useNewUrlParser: true
};
MongoClient.connect(url, (err, client) => {
  db = client.db("star_login");
  if (err) {
  	console.log(err) 
  	return ;
  }
  console.log("mongo connection success")
})


app.get("/", (req, res) => {
	// //用collection 跟 find方法查找数据可用的方法，当然 这没有意义
	// var cursor = db.collection('login').find()
	// //console.log(cursor)
	db.collection('userCollection').find().toArray(function(err, results) {
	  if (err) console.log(err)
	  	return ;
	  	console.log(results)
	})
	res.sendFile(__dirname + '/index.html');
});

app.get("/join", (req, res) => {
	res.sendFile(__dirname + '/public/views/join.html');
});


//接口
app.post("/api/addUser", (req, res) => {
	db.collection('userCollection').insertOne(req.body, (err, result) => {
		if (err) {
			console.log("========",req.body, err)
			return;
		}
		console.log('saved to database')
		res.redirect('/');
	});
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