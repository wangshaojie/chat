var addUser = document.querySelector('#addUser');
var nameVal = document.querySelector('#nameVal');

//var connected = false;
// var socket = io();
// socket.on('nameRepeat', function(){
//   alert("用户名重复")
// })

addUser.addEventListener('click', function () {
  window.location.href = "/" + 123;
  return false;
    axios.post('api/addUser', {
      'userName': nameVal.value
    })
    .then(function (response) {
      console.log(response)
      if(response.data.status == 0){
        //socket.emit('add user', nameVal.value, response.data.info.id);
        window.location.href = "/" + response.data.info.id
      }
    })
    .catch(function (error) {
      console.log(error);
    });
});


const addParticipantsMessage = (data) => {
  var message = '';
  if (data.clients === 1) {
    message += "there's 1 participant";
  } else {
    message += "there are " + data.clients + " participants";
  }
  log(message);
}


const log = (message, options) => {
  var $el = $('<li>').addClass('log').text(message);
  $('body').append($el);
}