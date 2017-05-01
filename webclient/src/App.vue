<template>
  <div id="main-content">
    <LoginForm v-if="!isLoggedIn()"></LoginForm>
    <MainPage v-if="isLoggedIn()"></MainPage>
  </div>
</template>

<script>

  import axios from 'axios';

  document.title = "Honway Internationl Portal";

var comp = {
  data: () => {
    return {
      'logged_in' : 0
    }
  },
  methods: {
    isLoggedIn () {
      return  this.logged_in == 1;
    }
  },
  components : { //register component locally
    'LoginForm' : require('./components/LoginForm.vue'), //one line require local components!!!
    'MainPage' : require('./components/MainPage.vue') //one line require local components!!!
  }
}

comp.mounted = function() {
  //maybe we can set a timer to poll the server to make sure this access_token is still valid 
  //or maybe we can have websocket open to listen to the access_token
  var access_token = sessionStorage.getItem('access_token');
  if (access_token != undefined && access_token.length > 0) {
    this.logged_in = 1;
  }
}

export default comp;
</script>
