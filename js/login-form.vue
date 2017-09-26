<template>
  <div class="main">
    <div class="text-align-center form-wrapper" :class="{'show': rendered}">
      <form class="" id="unpw-form" v-on:submit.prevent="submitLogin">
        <h1 class="log-in">
          Log In As:
        </h1><br>
        <select class="user-type" name="user-type" v-model="usertype">
          <option value="Passenger">Passenger</option>
          <option value="Driver">Driver</option>
          <option value="Dispatcher">Dispatcher</option>
        </select>
        <br>
        <input type="text" v-model="username" name="username" placeholder="Client ID">
        <br>
        <input type="password" v-model="password" name="password" id="pw" placeholder="Password">
        <br><br><br>
        <button type="submit" id="login">Login</button>
      </form>

      <br><br><br> For a demo, enter username
      <b>test</b> and password
      <b>test</b>. Contact markthomasnoonan@gmail.com with questions or feedback.
    </div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      usertype: this.initUserType,
      username: "",
      password: "",
      rendered: false
    }
  },
  mounted: function() {
    setTimeout((function() {
      this.rendered = true;
    }).bind(this));
  },
  props: ["initUserType"],
  methods: {
    submitLogin: function(event) {
      this.$emit('login', { username: this.username, password: this.password, usertype: this.usertype });
    }
  }
}
</script>


<style scoped>
textarea {
  width: 240px;
  height: 150px;
}

a {
  text-decoration: none;
  color: inherit;
}

.main {
  width: 100%;
  background-image: url("~assets/paratransitpal1.jpg");
  background-repeat: no-repeat;
  background-position: 50% 20%;
}

#login {
  transition: opacity 200ms ease-in;
}

.form-wrapper {
  display: inline-block;
  border: 1px solid rgba(100, 100, 100, 0.5);
  background-color: rgba(255, 255, 255, 0.6);
  margin-top: 147px;
  border-radius: 4px;
  padding: 10px;
  width: 250px;
  pointer-events: 0;
  opacity: 0;
}

input,
button,
select {
  padding: 6px;
  border: 1px solid #696969;
  border-radius: 4px;
}

input,
select {
  font-size: 1em;
  width: 100px;
  margin: 10px 2px;
}

button {
  background-color: #f1f1f1;
  font-size: 0.8em;
  padding: 10px 16px;
  text-transform: uppercase;
  margin: 6px;
  border-color: #aaa;
}

.log-in {
  font-size: 12px;
  padding-bottom: 2px;
  margin-bottom: 0;
  display: inline-block;
  font-weight: bold;
}

.text-align-center {
  text-align: center;
}

.show {
  opacity: 1;
  pointer-events: all;
  transition: opacity 600ms
}
</style>
