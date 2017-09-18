import Vue from 'vue';
import LoginForm from './login-form.vue';
import PassengerView from './passenger-view.vue';

const LOGIN_URL = "./api/test";

new Vue({
    el: '#app',
    components: {
        LoginForm,
        PassengerView
    },
    data: {
        userInfo: null,
        userType: "Passenger",
    },
    computed: {
        loggedIn: function () {
            return this.userInfo != null;
        }
    },
    methods: {
        login: function (loginInfo) {
            var vm = this;
            var tripReq = this.request(LOGIN_URL, 'POST', "username=" + loginInfo.username + "&password=" + loginInfo.password, { 'content-type': 'application/x-www-form-urlencoded' });
            tripReq.then(function (dat) {
                vm.userInfo = JSON.parse(dat);
                vm.userType = loginInfo.usertype;
            });
        },
        request: function (url, method, params, headers) {
            headers = headers || {};
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open(method, url, true);
                for (var head in headers) {
                    xhr.setRequestHeader(head, headers[head]);
                }
                xhr.onload = function () {
                    if (xhr.readyState == 4 && xhr.status === 200) {
                        resolve(xhr.responseText);
                    } else {
                        reject(Error('Request failed, status was ' + xhr.statusText));
                    }
                };
                xhr.send(params);
            });
        }
    }
});