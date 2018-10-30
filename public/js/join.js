var addUser = document.querySelector('#addUser');
var nameVal = document.querySelector('#nameVal');

var connected = false;
var socket = io();
socket.on('nameRepeat', function(){
  alert("用户名重复")
})

addUser.addEventListener('click', function () {
    axios.post('api/addUser', {
      'userName': nameVal.value
    })
    .then(function (response) {
      if(response.data.status == 0){
        socket.emit('add user', nameVal.value)
        window.location.href = "/" + response.data.info.id
      }
    })
    .catch(function (error) {
      console.log(error);
    });
});

// Whenever the server emits 'login', log the login message
// socket.on('login', (data) => {
//   console.log(data, "--")
//   connected = true;
//   // Display the welcome message
//   var message = "Welcome to Socket.IO Chat – ";
//   log(message, {
//     prepend: true
//   });
//   addParticipantsMessage(data);
// });


// socket.on('user joined', (data) => {
//   console.log(",",data)
//   log(data.username + ' joined');
//   addParticipantsMessage(data);
// });


socket.on('user joined', function(data){
  console.log(",",data)
})


const addParticipantsMessage = (data) => {
  var message = '';
  if (data.clients === 1) {
    message += "there's 1 participant";
  } else {
    message += "there are " + data.clients + " participants";
  }
  log(message);
}

// Log a message
const log = (message, options) => {
  var $el = $('<li>').addClass('log').text(message);
  $('body').append($el);
}