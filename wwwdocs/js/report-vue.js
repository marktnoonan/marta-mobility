var db = firebaseApp.database();
var ref = 'reports/' + window.location.href.substr(window.location.href.search(/\/report\/.*/) + 8);
var reportRef = db.ref(ref);

var reportVue = new Vue({
    el: "#report",
    data: {
        report: {
            'prettyTime': '',
            'category': '',
            'comments': '',
            location: {
                'latitude': '',
                'longitude': ''
            }
        }
    },
    firebase: {
        report: {
            source: reportRef,
            asObject: true,
            readyCallback: function() {
                this.report.prettyTime = makeTimePretty(new Date(this.report.time));
            }
        }
    },
    methods: {

    }
});