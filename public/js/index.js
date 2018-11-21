function append(parent, text) {
    if (typeof text === 'string') {
        var temp = document.createElement('div');
        temp.innerHTML = text;
        // 防止元素太多 进行提速
        var frag = document.createDocumentFragment();
        while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
        }
        parent.appendChild(frag);
    }
    else {
        parent.appendChild(text);
    }
};

const $window = $(window);  
var $usernameInput = $('#m');
var conversation = document.getElementById('conversation');
var $currentInput = $usernameInput.focus();



var socket = io("localhost:3000");

socket.on('connect', function() {
  console.log('连接成功');
  socket.emit('join chat', window.userInfo);
});

var serverGetIp = null;
var localGetIP = null;
getLocalIP().then((ipAddr) => {
	localGetIP = ipAddr;
});


//在线人数
socket.on('onlineNum', function(msg){
	document.querySelector(".sumOnlineNum").innerHTML = msg.description;
});

//全局广播接收谁离开了
socket.on('leave', function(msg){
  console.log(msg.description + "离开了")
});

var submitBtn = document.querySelector(".reply-send");
submitBtn.addEventListener("click", sendMessage);

var sendMessage = function (event){
	var m = document.getElementById("m");
	if(m.value == '') {
		window.alert("不能发送空白消息") 
		return;
	}
  let id = m.getAttribute("data-id");
  let name = m.getAttribute("data-name");
  window.sendMsg(m.value)
	socket.emit('chat message', m.value);
  console.log(m.value)
	m.value = '';
	return false;
};

window.sendMsg = function(msg){
  socket.send(msg);
}


//接受推送的消息渲染
const renderChatList = function(data){
  var selfTmpl = `
    <div class="row message-body">
          <div class="col-sm-12 message-main-receiver">
            <div class="receiver">
              <div class="message-text">
                ${data.content}
              </div>
              <span class="message-time pull-right">
                ${data.userName}
              </span>
            </div>
          </div>
        </div>
  `

  var otherTmpl = `
    <div class="row message-body">
          <div class="col-sm-12 message-main-sender">
            <div class="sender">
              <div class="message-text">
                ${data.content}
              </div>
              <span class="message-time pull-right">
                ${data.userName}
              </span>
            </div>
          </div>
        </div>
  `
  if(serverGetIp != localGetIP){
    return otherTmpl
  }else{
    return selfTmpl
  }
}

//发送消息
socket.on('chat message', function(data){
  console.log(data)
  var dom = renderChatList(data);
  $("#conversation").append(dom);
  conversation.scrollTop = conversation.scrollHeight;
});


//查询聊天记录
// socket.on('allChatInfo', function(result){
//   for (let i = 0; i < result.length; i++) {
//       let data = result[i];
//       var dom = renderChatList(data);
//       $("#conversation").append(dom);
//       conversation.scrollTop = conversation.scrollHeight;
//     }
// });

//把当前用户信息推到服务里
socket.emit('add user', window.userInfo.name, window.userInfo.id);


//左侧列表渲染
socket.on('onlineCliens', function(data){
  var rootDom = document.querySelector("#userList");
  for (var i = 0; i < data.length; i++) {
    var listTmpl = `
    <div class="row sideBar-body">
      <div class="col-sm-3 col-xs-3 sideBar-avatar">
        <div class="avatar-icon">
          <img src="${data[i].image}">
        </div>
      </div>
      <div class="col-sm-9 col-xs-9 sideBar-main">
        <div class="row">
          <div class="col-sm-8 col-xs-8 sideBar-name">
            <span class="name-meta">${data[i].name}
          </span>
          </div>
          <div class="col-sm-4 col-xs-4 pull-right sideBar-time">
            <span class="time-meta pull-right">
          </span>
          </div>
        </div>
      </div>
    </div>
  `
  $(rootDom).append(listTmpl)
  }
  
});


$window.keydown(event => {
  if (!(event.ctrlKey || event.metaKey || event.altKey)) {
    $currentInput.focus();
  }
  if (event.which === 13) {
    sendMessage();
  }
});

$usernameInput.keypress(function(event) {
  back(this, event)
});

var back = function(ele, event) {
  if(event.keyCode==13){
    event.preventDefault();
  }
};


