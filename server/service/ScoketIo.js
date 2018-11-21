const socketio = require('socket.io');
const mysql  = require('mysql');
const DBconfig = require('../db/DBConfig');
const utilSQL = require('../db/usersql');
const pool = mysql.createConnection( DBconfig.mysql );
const snowflake = require('node-snowflake').Snowflake;
var _ = require("underscore");

//用户头像
const userDefaultImgArr = 
['http://placekitten.com/300/201',
'http://placekitten.com/300/200',
'http://placekitten.com/300/202',
'http://placekitten.com/300/203',
'http://placekitten.com/300/204',
'http://placekitten.com/300/205',
'http://placekitten.com/300/206'];
var index = Math.floor((Math.random()*userDefaultImgArr.length));

class SocketIo{
	constructor(){
		
	}
	init(server){
		this.io = socketio(server);
		this.onConnect();
  		global.socketio = this.io;
	}
	onConnect(){
		var _this = this;
		let _allUser = [];
		let _userInfo = {};
		var clientsNum = 0;  //统计在线人数
		_this.io.on('connection', socket=> {
			clientsNum ++;

			// 获取用户ID
			var url = socket.request.headers.referer;
		  	var splited = url.split('/');
		  	var userID = splited[splited.length - 1];   

		  	//用户离开
			socket.on('disconnect', ()=> {
				clientsNum --;
				_.each(_allUser, element => {
					console.log(element)
			        // socket.leave(element, ()=> {
			        // 	socket.emit("leave", { description: clientsNum + ' 人离线!'})
			        // });
			     });
			});

			//当前在线数发送到前台
			socket.emit('onlineNum', { description: clientsNum + ' 人在线!'});
			//所有在线人员列表
			socket.emit('onlineCliens', _allUser); 

			//记录加入人信息
			socket.on('join chat', userInfo => {
				_userInfo = userInfo;
				_userInfo.image = userDefaultImgArr[index];
				_allUser.push(_userInfo);
				console.log(_userInfo.name + '加入了');
			});

			//接收聊天信息，发送出去
			socket.on('chat message', function(message){
				//console.log(onlineClients)
				let data = {
					content : message,
					userName : _userInfo.name,
					userId : _userInfo.id
				};			
				socket.emit('chat message', data);
			});

		})
	}
}



module.exports = new SocketIo();