/* import Vue from 'vue';
 */import LoginForm from './login-form.vue';
import PassengerView from './passenger-view.vue';

const LOGIN_URL = "./api/test";

var firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyAVILGslPYXyEa1kF84vxk3d2OxKzxhweo",
    authDomain: "mobility-66c54.firebaseapp.com",
    databaseURL: "https://mobility-66c54.firebaseio.com",
    projectId: "mobility-66c54",
    storageBucket: "mobility-66c54.appspot.com",
    messagingSenderId: "582170341021"
  });
var db = firebaseApp.database();

new Vue({
    el: '#app',
    components: {
        LoginForm,
        PassengerView
    },
    data: {
        userInfo: null,
        userType: "Passenger",
        userReports: null,
    },
    computed: {
        loggedIn: function () {
            return this.userInfo != null;
        }
    },
    firebase: {
        reports: 
            db.ref('/reports'),
            /* asObject: true,
            readyCallback: function() {
                console.log('FIREBASE READY');
            }
        } */
    },
    methods: {
        login: function (loginInfo) {
            var vm = this;
            var tripReq = this.request(LOGIN_URL, 'POST', "username=" + loginInfo.username + "&password=" + loginInfo.password, { 'content-type': 'application/x-www-form-urlencoded' });
            tripReq.then(function (dat) {
                vm.userInfo = JSON.parse(dat);
                vm.userType = loginInfo.usertype;
                vm.userReports = vm.reports;
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