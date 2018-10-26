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

    	
var socket = io();
var serverGetIp = null;
var localGetIP = null;
getLocalIP().then((ipAddr) => {
	localGetIP = ipAddr;
});

//全局广播接收
socket.on('userCount', function(msg){
	document.querySelector(".sumOnlineNum").innerHTML = msg.description;
	serverGetIp = msg.ip;
});

var submitBtn = document.querySelector(".reply-send");
submitBtn.addEventListener("click", submitForm);
function submitForm(){
	var m = document.getElementById("m");
	if(m.value == '') {
		window.alert("不能发送空白消息") 
		return;
	}
  let id = m.getAttribute("data-id");
  let name = m.getAttribute("data-name");
  var formData = {
    "id" : id,
    "message" : m.value
  }
	socket.emit('chat message', m.value);
	m.value = '';
	return false;
}

//接受推送的消息渲染
socket.on('chat message', function(data){
	var ul = document.querySelector("#conversation");
	var selfTmpl = `
		<div class="row message-body">
          <div class="col-sm-12 message-main-receiver">
            <div class="receiver">
              <div class="message-text">
                ${data.msg}
              </div>
              <span class="message-time pull-right">
                ${data.name}
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
                ${data.msg}
              </div>
              <span class="message-time pull-right">
                ${data.name}
              </span>
            </div>
          </div>
        </div>
	`
	if(serverGetIp != localGetIP){
		$("#conversation").append(otherTmpl)
	}else{
		$("#conversation").append(selfTmpl)
	}
	
});

//左侧列表渲染
socket.on('chat getNum', function(data){
  var rootDom = document.querySelector("#userList");
  var listTmpl = `
    <div class="row sideBar-body">
      <div class="col-sm-3 col-xs-3 sideBar-avatar">
        <div class="avatar-icon">
          <img src="https://bootdey.com/img/Content/avatar/avatar1.png">
        </div>
      </div>
      <div class="col-sm-9 col-xs-9 sideBar-main">
        <div class="row">
          <div class="col-sm-8 col-xs-8 sideBar-name">
            <span class="name-meta">John Doe
          </span>
          </div>
          <div class="col-sm-4 col-xs-4 pull-right sideBar-time">
            <span class="time-meta pull-right">18:18
          </span>
          </div>
        </div>
      </div>
    </div>
  `
  $("#conversation").append(listTmpl)
})