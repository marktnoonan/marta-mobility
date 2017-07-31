function ReportDisplay(firebaseInstance, reportId) {
   var firebase = firebaseInstance;
   var reportId = reportId;
   this.reportData = {};

   this.getReportInfo = function() {
       var ref = firebase.database();
       ref = ref.ref('reports/' + reportId);

       var updateData = function(data) {
            this.reportData = data.val();
            this.reportData.prettyTime = makeTimePretty(new Date(this.reportData.time));
            updateHandlebars();
            console.log(data.val());
       };
       updateData = updateData.bind(this);

       ref.on('value', updateData);
   }

}

reportId = window.location.href.substr(window.location.href.search(/\/report\/.*/) + 8);
report = new ReportDisplay(firebase, reportId);
report.getReportInfo();

document.addEventListener("DOMContentLoaded", updateHandlebars);

function updateHandlebars() {
    reportTemplate = document.getElementById("entry-template");
    output = document.getElementById("content");
    pushHandlebars(reportTemplate.innerHTML, output);
    var firstHandlebarsPush = true;
}

function pushHandlebars(handlebarsTemplate, destination) {
  window.scrollTo(0, 0);
  var template = Handlebars.compile(handlebarsTemplate);
  var html = template(report.reportData);
  destination.innerHTML = html;
}
