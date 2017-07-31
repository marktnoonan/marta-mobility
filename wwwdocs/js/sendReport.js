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
        getEmailAddresses();
    }

    getEmailAddresses = function(){
      var emails = []
      var personalEmail;
      firebase.database().ref('info/email').on("value", function (snapshot) {
        personalEmail = snapshot.val();
      });
      emails.push(personalEmail);


      firebase.database().ref('emergency-contacts').on("value", function (snapshot) {
        var contacts = snapshot.val();
        for (var contact in contacts) {
          if (contacts.hasOwnProperty(contact)) {
          emails.push(contacts[contact].email);
          }
        }
      });

      emails.forEach(function(address){
          sendEmail(address,"some report data");
      });

      function sendEmail(address, body){
        console.log("I'm trying to send an email here");
        var xhr = new XMLHttpRequest();
        xhr.open('POST', "../src/email/martatesto.php", true);
        xhr.send("emailAddress=" + encodeURIComponent(address) + "&emailBody=" + encodeURIComponent(body));
      }

    }

    addNodeData = function(lat, long, resource) {
console.log("adding node data");
      return new Promise(function(resolve, reject) {

        var xhr = new XMLHttpRequest();
        xhr.open('POST', "../src/IntelligentCities.php", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onload = function() {
          if (xhr.readyState == 4 && xhr.status === 200) {
            resolve(
              firebase.database().ref('reports/' + reportId + '/nodedata').set(xhr.responseText)
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
