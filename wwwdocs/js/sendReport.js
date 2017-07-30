function Report(firebaseInstance, userId, category) {

    var _reportLinkBase = window.location.hostname + "/mark/c3/wwwdocs/report/";

    var firebase = firebaseInstance;
    var userId = userId;
    var reportId = generateReportId();

    this.generateReport = function() {
        var location;
        reportData = {
            'time': (new Date()).getTime(),
            'category': category,
            'userId' : userId
        };
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(res) {
                    reportData.location = {
                        'latitude': res.coords.latitude,
                        'longitude': res.coords.longitude
                    }
                    sendReport(reportId, reportData);
            });
        } else {
            sendReport(reportId, reportData);
        }

    }

    sendReport = function(reportId, reportData) {
        firebase.database().ref('reports/' + reportId).set(reportData);
    }

    this.addComments = function(comments) {
        firebase.database().ref('reports/' + reportId + '/comments').set(comments);
    }

    this.getReportLink = function() {
        return _reportLinkBase + reportId;
    }

    function generateReportId() {
        return userId + '_' + Math.round((new Date()).getTime() / 1000);
    }

}
