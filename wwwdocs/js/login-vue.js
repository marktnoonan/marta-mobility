Vue.component('login-form', {
    template:  `<div class="text-align-center form-wrapper">
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

    <br><br><br> For a demo, enter username <b>test</b> and password <b>test</b>. Contact markthomasnoonan@gmail.com with
    questions or feedback.
  </div>`,
  data: function() {
      return {
          usertype: "",
          username: "",
          password: ""
      }
  },
  methods: {
      submitLogin: function(event) {
        this.$emit('login', {username: this.username, password: this.password, usertype: this.usertype});
      }
  }
});