<style>
div#login_form {
  border: 1px silver solid;
}
</style>

<template>
  <div id="login_form">
    <h1>Welcome to Honway Online Portal, Please Login</h1>
    <div v-if="logged_in == 1">
      <div id="user_login_form_error">
        <p>Error Logging In now, try again later......</p>
      </div>
    </div>
    <div>
      <label>UserName:</label><input id="username" type="text" v-model = "username" @keyup.enter = 'focusOnPassword'></input>
    </div>
    <div>
      <label>Password:</label><input id="password" type="password" v-model = "password" @keyup.enter = "userLoginFormSubmit"></input>
    </div>
    <div>
      <button @click = "userLoginFormSubmit">Login</button>
    </div>
  </div>
</template>


<script>
  import Vue from 'vue';
import axios from 'axios';

var _ = {name: 'login_form'};

//methods
var m = {};
m.userLoginFormSubmit = function(event) {
  var _username = this.username.trim();
  var _password = this.password.trim();
  axios.post("/api/user/authenticate", { 
    username: _username,
    password: _password
  }).then((response) => {
    var data = response.data;
    if (data.success == 1 && data.access_token.length > 0) {
      //store the access token into session storage 
      sessionStorage.setItem('access_token', data.access_token);
      sessionStorage.setItem('permissions', data.permissions);
      location.reload(true);
    } else {
      this.username = '';
      this.password = '';
      this.login_error = 1; //try to log in but fail
      var el_username = document.querySelector("#login_form #username");
      el_username.focus();

    }
  }).catch( error => { //use arrow function to access the outside this
    this.login_error = 1; //try to log in but fail
    var el_username = document.querySelector("#login_form #username");
    el_username.focus();
  });
}

m.focusOnPassword = function(event) {
  var el_password = document.querySelector("#login_form #password");
  el_password.focus()
}

_.methods = m;

//data 
var data = {};
data.logged_in = 0; // 0 -- not logged in , 1 --- logged in
data.login_error = 0; // 0 -- no error, 1 -- error
data.username = '';
data.password = '';

_.data = function() { return data; }

export default _;
</script>
