var addUser = document.querySelector('#addUser');
var nameVal = document.querySelector('#nameVal');
addUser.addEventListener('click', function () {
    axios.post('api/addUser', {
      'userName': nameVal.value
    })
    .then(function (response) {
      if(response.data.status == 0){
        window.location.href = "/" + response.data.info.id
      }
    })
    .catch(function (error) {
      console.log(error);
    });
});