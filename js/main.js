import Vue from 'vue';
import LoginForm from './login-form.vue';
import PassengerView from './passenger-view.vue';
import DriverView from './driver-view.vue';
import DispatcherView from './dispatcher-view.vue';
import firebase from 'firebase';
import VueFire from 'vuefire';

const LOGIN_URL = "./api/login";

Vue.use(VueFire);

var firebaseConfig = {
    apiKey: "AIzaSyCf7rZkSE6Xnl4Ag-vxhrrtGWs2yosf0pA",
    authDomain: "mobility-eta.firebaseapp.com",
    databaseURL: "https://mobility-eta.firebaseio.com",
    projectId: "mobility-eta",
    storageBucket: "",
    messagingSenderId: "142807263400"
};
var firebaseApp = firebase.initializeApp(firebaseConfig);
var db = firebaseApp.database();

new Vue({
    el: '#app',
    components: {
        LoginForm,
        PassengerView,
        DriverView,
        DispatcherView
    },
    data: {
        userInfo: null,
        userType: "Passenger",
        userReports: null,
        userContacts: null,
        userLocations: null,
    },
    computed: {
        loggedIn: function () {
            return this.userInfo != null;
        }
    },
    firebase: {
        reports: db.ref('/reports'),
        fbUserInfo: {
            source: db.ref('/info'),
            asObject: true
        },
        etaRef: {
            source: db.ref("eta-from-marta"),
            asObject: true
        },
        modifierRef: {
            source: db.ref("eta-modifier"),
            asObject: true
        },
        emergencyContactsRef: db.ref("emergency-contacts"),
        myInfoRef: {
            source: db.ref("info"),
            asObject: true
        },
        locationsRef: db.ref("saved-locations")
    },
    methods: {
        login: function (loginInfo) {
            var vm = this;
            var tripReq = this.request(LOGIN_URL, 'POST', "username=" + loginInfo.username + "&password=" + loginInfo.password, { 'content-type': 'application/x-www-form-urlencoded' });
            tripReq.then(function (dat) {
                vm.userInfo = JSON.parse(dat);
                vm.userInfo.fbUserInfo = vm.fbUserInfo;
                vm.tripInfo = {
                    eta: vm.etaRef,
                    modifier: vm.modifierRef
                };
                vm.userType = loginInfo.usertype;
                vm.userReports = vm.reports;
                vm.userContacts = vm.emergencyContactsRef;
                vm.userLocations = vm.locationsRef;
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
        },
        updateFirebase: function ($event) {
            switch ($event.type) {
                case 'userInfo': this.$firebaseRefs.myInfoRef.set($event.info); break;
            }
        },
        submitReport: function ($event) {
            var reportId = this.userInfo.userId + '_' + Math.round((new Date()).getTime() / 1000);
            this.$firebaseRefs.reports.child(reportId).set($event);
        }
    }
});