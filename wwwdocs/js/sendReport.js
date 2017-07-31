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
                    //hardcoding for demo since if user is not in the smart city bounding box
                    //they will not actually get any node data
                    addNodeData("33.754226", "-84.396138", "notETA");
                    //real call would be addNodeData(reportData.location.latitude, reportData.location.latitude, "notETA");
            });
        } else {
            sendReport(reportId, reportData);
        }

    }

    sendReport = function(reportId, reportData) {
        firebase.database().ref('reports/' + reportId).set(reportData);
    }

    addNodeData = function(lat, long, resource) {

      return new Promise(function(resolve, reject) {

        var xhr = new XMLHttpRequest();
        xhr.open('POST', "../src/IntelligentCities.php", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onload = function() {
          if (xhr.readyState == 4 && xhr.status === 200) {
            resolve(
              firebase.database().ref('reports/' + reportId + '/nodedata').set(JSON.parse((xhr.responseText).substr(6302)))
            );} else {
            reject(Error('Request failed, status was ' + xhr.statusText));
          }
        };
        xhr.send("myLat=" + lat + "&myLong=" + long + "&resource=" + resource);
      });

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
