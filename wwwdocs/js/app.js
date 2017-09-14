
var context = {}; // context object holds data accessible to handlebars and application state.

var firstBooking = null;
var bell = null;
var showingMenu = false;

var database = firebase.database();
var etaRef = database.ref("eta-from-marta");
var modifierRef = database.ref("eta-modifier");
var emergencyContactsRef = database.ref("emergency-contacts");
var myInfoRef = database.ref("info");
var locationsRef = database.ref("saved-locations");
var reportsRef = database.ref("reports");
var dbResults = {};

// intending to keep this global for now.
var report;

var g1; // global for development

function paraRequest(url, method, params, headers) {
  headers = headers || {};
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    for(var head in headers) {
      xhr.setRequestHeader(head, headers[head]);
    }
    xhr.onload = function() {
      if (xhr.readyState == 4 && xhr.status === 200) {
        resolve(xhr.responseText);
      } else {
        reject(Error('Request failed, status was ' + xhr.statusText));
      }
    };
    xhr.send(params);
  });
}

function makeTimePretty(time){
  return time.toDateString() + ", " + convertTimeFromMinutes(convertTimeToMinutes(time.toTimeString().substr(0, 5)));
}

function convertTimeToMinutes(time) {
  var timeInMinutes = time.split(":");
  timeInMinutes = (timeInMinutes[0] * 60) + parseInt(timeInMinutes[1]);
  return timeInMinutes;
}

function convertTimeFromMinutes(minutes) {
  var minuteSegment = minutes % 60;
  //adding the leading zero to minute if needed.
  minuteSegment = minuteSegment < 10 ? "0" + minuteSegment : minuteSegment;
  var hourSegment = (minutes - minuteSegment) / 60;
  var amPm = hourSegment < 12 ? "AM" : "PM";
  // converting from Military time if needed.
  var convertedHour = hourSegment === 12 ? hourSegment : hourSegment % 12;
  // adding leading zero to hour if hour is 0.
  convertedHour = convertedHour === 0 ? "0" + convertedHour : convertedHour;
  return convertedHour + ":" + minuteSegment + " " + amPm;
}

function addStartingListeners() {

  document.querySelector('.menu-open').addEventListener('click', openMenu);

  var menuItems = [].slice.call(document.querySelectorAll('.menu-list > li'));

  for (var i = 0; i < menuItems.length; i++) {
    menuItems[i].addEventListener('click', function() {
      handleMenu(this.getAttribute("data-request"));
    })
  }

  document.querySelector('select[name=user-type]').addEventListener('change', function() {
    context.userType = this.value;
  });

  document.querySelector('#login').addEventListener('click', function() {
    var username = document.querySelector('input[name=providedUsername]').value;
    var password = document.querySelector('input[name=providedPassword]').value;
    context.username = username;
    getTrips(username, password);

  });

  document.querySelector('#pw').addEventListener('keyup', function(event) {
    if (event.keyCode == 13) {
      var username = document.querySelector('input[name=providedUsername]').value;
      var password = document.querySelector('input[name=providedPassword]').value;
      context.username = username;


      getTrips(username, password);

    }
  });
}

function openMenu() {
  if (!showingMenu) {
    showingMenu = true;
    document.querySelector('.menu-panel').classList.remove("hidden");
  } else if (showingMenu) {
    showingMenu = false;
    document.querySelector('.menu-panel').classList.add("hidden");
  }
}

function handleMenu(request) {

  if (request === "logout") {
    location.reload();
  } else if (request === "reports") {
    showMyReports();
  } else if (request === "information") {
    showMyInfo();
  }

}

// this function doesn't seem to get called?
function getNodeData(lat, long, resource) {
  var nodeReq = paraRequest("../src/IntelligentCities.php", 'POST', "myLat=" + lat + "&myLong=" + long + "&resource=" + resource, {'content-type': 'application/x-www-form-urlencoded'});
  nodeReq.then(function(nodeData) {
    context.nodeData = nodeData;
  });
  return nodeReq;
}

function getTrips(username, password) {
  var tripReq = paraRequest("./api/login", 'POST', "username=" + username + "&password=" + password, {'content-type': 'application/x-www-form-urlencoded'});
  tripReq.then(function(dat) {
    addMartaDataToDom(dat);
  });
  return tripReq;
}

// this function starts listening to firebase after data has been retrieved from the MARTA site.
function addMartaDataToDom(xhrResponse) {

  if (context.userType === "Passenger") {
    var mainHandlebarsTemplate = document.querySelector("#entry-template").innerHTML;
  } else if (context.userType === "Driver") {
    var mainHandlebarsTemplate = document.querySelector("#driver-template").innerHTML;
  } else if (context.userType === "Dispatcher") {
    var mainHandlebarsTemplate = document.querySelector("#dispatcher-template").innerHTML;
  }

  var mainOutputDiv = document.querySelector('#output');
  var proceed = true;

  try {
    context['dataFromMarta'] = JSON.parse(xhrResponse);
  } catch (err) {
    console.log("error: " + err);
    proceed = false;
  }

  if (proceed) {
    pushHandlebars(mainHandlebarsTemplate, mainOutputDiv);
    document.querySelector(".form-wrapper").classList.add("hidden");
    document.querySelector(".header").classList.add("show");
    listenToFirebase();
  } else {
    document.querySelector('#output').innerHTML = '<br><br><Br><span style="color:#ff7e72">Client ID or password not found.</span>';
  }
}

function showMyReports() {
  var myReportTemplate = document.querySelector('#my-reports-template').innerHTML;
  var myInfoOutput = document.querySelector('.my-info-output');
  for (var theReport in dbResults.reports) {
    var iconString = getReportIcon(dbResults.reports[theReport].category);
    dbResults.reports[theReport].iconString = iconString;

    if (typeof dbResults.reports[theReport].nodedata === 'string'){
      dbResults.reports[theReport].nodedata = JSON.parse(dbResults.reports[theReport].nodedata);
      if (dbResults.reports[theReport].nodedata[0].vehicleSpeed === "NaN"){
        dbResults.reports[theReport].nodedata[0].vehicleSpeed = "0";
      }
    }
    
    var reportTime = new Date(dbResults.reports[theReport].time);
    var prettyTime = makeTimePretty(reportTime);
    dbResults.reports[theReport]["prettyTime"] = prettyTime;

    var lat = dbResults.reports[theReport].location.latitude;
    var long = dbResults.reports[theReport].location.longitude;
    if (typeof(dbResults.reports[theReport].prettyAddress) == 'undefined' || dbResults.reports[theReport].prettyAddress == '') {
      reverseGeocode(lat,long, theReport).then(function() {
        pushHandlebars(myReportTemplate, myInfoOutput);
        addReportCloserListener();
        });
    }
  }

  pushHandlebars(myReportTemplate, myInfoOutput);
  myInfoOutput.classList.add("show");
  addReportCloserListener();

  function addReportCloserListener() {
    var closer = document.querySelector('.closer-for-my-reports');
    closer.addEventListener("click", function() {
      console.log("closing");
      document.querySelector(".my-info-output").classList.remove("show");
      document.querySelector(".menu-panel").classList.add("hidden");
      showingMenu = false;
    });
  }
}

function reverseGeocode(lat, long, reportIdx){
  var url ="https://api.opencagedata.com/geocode/v1/json?q="+lat+"%2C"+long+"&pretty=1&no_annotations=1&key=2b9e7715faf44bf2bb2f60bbae2768ba";
  var geoReq = paraRequest(url, "GET", null);
  geoReq.then(function(geoData) {
    dbResults.reports[reportIdx]["prettyAddress"] = JSON.parse(geoData).results[0].formatted;
  });
  return geoReq;
}

function showMyInfo() {
  var myInfoTemplate = document.querySelector('#my-info-template').innerHTML;
  var myInfoOutput = document.querySelector('.my-info-output');
  pushHandlebars(myInfoTemplate, myInfoOutput);
  myInfoOutput.classList.add("show");

  (function addMyInfoListeners() {
    var closer = document.querySelector('.closer-for-my-info');
    closer.addEventListener("click", function() {
      document.querySelector(".my-info-output").classList.remove("show");
      document.querySelector(".menu-panel").classList.add("hidden");
      showingMenu = false;
    });

    var editButtons = [].slice.call(document.querySelectorAll('.edit'));
    var doneButtons = [].slice.call(document.querySelectorAll('.done-editing'));
    for (var i = 0; i < editButtons.length; i++) {
      editButtons[i].addEventListener("click", function() {
        turnEditing.onFor(this.parentElement);
      });
      doneButtons[i].addEventListener("click", function() {
        turnEditing.offFor(this.parentElement);
      });
    }
  })();
}

var firstHandlebarsPush = true;

function pushHandlebars(handlebarsTemplate, destination) {
  window.scrollTo(0, 0);
  var source = source;
  var template = Handlebars.compile(handlebarsTemplate);
  var html = template(context);
  destination.innerHTML = html;

  if (firstHandlebarsPush) {
    firstBooking = context.dataFromMarta[0].bookings[0];
    if (context.userType === "Passenger") {
      checkDelay(firstBooking.endWindow, firstBooking.eta);
      addListeners();
      gaugeSetup();
    }
    firstHandlebarsPush = false;
  }
}

function startReport(action) {
  var report = new Report(firebase, context.username, action);
  report.generateReport();
  return report;
}

function getHelp(action) {
  console.log("Help requested: " + action);
  report = startReport(action);
  var actionSpecificText = "We have alerted your emergency contacts ";

  switch (action) {
    case "I am lost":
      actionSpecificText += "that you are lost. Get directions to: <ol> <li>A saved location</li><li>Your last drop-off location</li><li>Your next pickup location</li><li>Local police</li></ol>"
      break;
    case "I need help":
      actionSpecificText += "that you need help. You may wish to: <ol><li>Call 911</li><li>Get Directions</li></ol>"
      break;
    case "Incident Report":
      actionSpecificText += "that you are reporting an incident. "
      break;
    case "Crime Report":
      actionSpecificText += "that you are reporting a crime. "
      break;

    default:

  }

  document.querySelector("#report-category").textContent = action;
  document.querySelector("#action-specific-text").innerHTML = actionSpecificText;
  document.querySelector(".make-report").classList.add("show");
  window.scrollTo(0, 0);

  document.querySelector("#action-specific-text").innerHTML += 'A report is being generated at <a class="report-link">' + report.getReportLink() + "</a>.";
}

// adds
function addListeners() {

  var helpLink = document.querySelector(".bottom-show-menu-link");
  var bottomMenu = document.querySelector(".bottom-menu");
  var displayingBottomMenu = false;
  // at this point we have logged in so we show the menu
  bottomMenu.classList.remove("hidden");
  var bottomMenuItems = document.querySelectorAll(".bottom-menu > div");
  var closer = document.querySelector('span[class=closer]');
  var addCommentsButton = document.querySelector("button[name=submit-report]");

  addCommentsButton.addEventListener("click", function() {
    var commentsField = document.querySelector("textarea[name=what-happened]");
    report.addComments(commentsField.value);
    commentsField.value = "";
    document.querySelector(".make-report").classList.remove("show");
  })

  closer.addEventListener("click", function() {
    document.querySelector(".make-report").classList.remove("show");
  });


  helpLink.addEventListener("click", function() {

    if (!displayingBottomMenu) {
      bottomMenu.classList.add("bottom-menu-display");
      displayingBottomMenu = true;
    } else {
      bottomMenu.classList.remove("bottom-menu-display");
      displayingBottomMenu = false;
    }

    (function() {
      for (var i = 0; i < bottomMenuItems.length; i++) {
        bottomMenuItems[i].addEventListener("click", function(event) {
          event.stopPropagation();
          getHelp(this.getAttribute("data-action"));
        })
      }
    })();

  });

  bell = document.querySelector('.bell');

  // not using refresh button since we connected to firebase

  /*  document.querySelector('#refresh').addEventListener('click', function() {
      var username = document.querySelector('input[name=providedUsername]').value;
      var password = document.querySelector('input[name=providedPassword]').value;

      getTrips(username, password);

    });*/

}

function checkDelay(windowEnd, eta) {

  var etaField = document.querySelector('.eta');
  var lateSatusField = document.querySelector('span.late-status');
  var bookedTracker = document.querySelector('.booked');
  var fiveMinuteTracker = document.querySelector('.five-minutes');
  var scheduledTracker = document.querySelector('.scheduled');
  var tripSoonTracker = document.querySelector('.trip-soon');
  var hereNowTracker = document.querySelector('.here-now');

  var now = new Date();
  var nowInMinutes = (now.getHours() * 60) + now.getMinutes();

  // initiating since if we have the trip in our list, it was definitely booked.
  completeStep(bookedTracker, "Booked");

  // if no ETA, change color and do nothing else
  if (!eta) {
    etaField.style.backgroundColor = "lightblue";
    return;
  }

  // but if we have an ETA, it means a bus is scheduled, so we can work with it.
  completeStep(scheduledTracker, "Van assigned");

  var theEtaInMinutes = convertTimeToMinutes(eta);
  var windowEndInMinutes = convertTimeToMinutes(windowEnd);
  var timeFromNow = theEtaInMinutes - nowInMinutes;

  if (timeFromNow <= 5 && timeFromNow > 0) {
    completeStep(fiveMinuteTracker, "5 min. away");
  }

  if (timeFromNow <= 30 && timeFromNow > 0) {
    completeStep(tripSoonTracker, "30 min. away");
  }

  if (timeFromNow <= 0 && timeFromNow > -10) {
    completeStep(hereNowTracker, "Arriving now!");
  }

  if (theEtaInMinutes > windowEndInMinutes) {
    lateSatusField.textContent = ", running late.";
  } else if (theEtaInMinutes <= windowEndInMinutes && windowEndInMinutes - theEtaInMinutes < 30) {
    lateSatusField.textContent = ", arriving in window.";
  } else {
    lateSatusField.textContent = ", arriving on time.";
  }
}

function getReportIcon(reportType) {

  var iconBuffer = '<i class="';

  switch (reportType) {
    case "I am lost":
      iconBuffer += "fa fa-map-marker"
      break;
    case "I need help":
      iconBuffer += "fa fa-flag"
      break;
    case "Incident Report":
      iconBuffer += "fa fa-info-circle"
      break;
    case "Crime Report":
      iconBuffer += "fa fa-gavel"
      break;
    default:
  }

  iconBuffer += ' fa-2x" aria-hidden="true"></i>';
  return iconBuffer;

}

function completeStep(trackerElement, requiredText) {
  trackerElement.classList.remove('future-step');
  trackerElement.classList.add('complete');
  trackerElement.setAttribute('data-text', requiredText);

  if (requiredText === "Arriving now!") {
    //TODO: there is a bug with this line if page loads at wrong time - element doesn't exist yet.
    //bell.classList.add('bell-shake');
  }
}

function listenToFirebase() {

  modifierRef.on("value", function(snapshot) {
    dbResults.modifier = snapshot.val();
    if (dbResults.etaFromMarta && g1) {
      combineDelays();
    }
    //getNewModifier("33.754226", "-84.396138", "eta");

  });

  etaRef.on("value", function(snapshot) {
    dbResults.etaFromMarta = snapshot.val();
    if (context.userType === "Passenger") {
      combineDelays();
    }
    if (context.userType === "Dispatcher"){
      pushHandlebars(document.querySelector("#dispatcher-template").innerHTML, document.querySelector('#output'));
    }

  });

  emergencyContactsRef.on("value", function(snapshot) {
    dbResults["emergency-contacts"] = snapshot.val();
  });

  myInfoRef.on("value", function(snapshot) {
    dbResults.info = snapshot.val();
  });

  locationsRef.on("value", function(snapshot) {
    dbResults["saved-locations"] = snapshot.val();
  });

  reportsRef.on("value", function(snapshot) {
    dbResults["reports"] = snapshot.val();
  });

  context.dbResults = dbResults;
}

function getNewModifier(lat, long, resource) {
console.log("adding node data");
  return new Promise(function(resolve, reject) {

    var xhr = new XMLHttpRequest();
    xhr.open('POST', "../src/IntelligentCities.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
      if (xhr.readyState == 4 && xhr.status === 200) {
        resolve(
          modifierRef.set(xhr.responseText))} else {
        reject(Error('Request failed, status was ' + xhr.statusText));
      }
    };
    xhr.send("myLat=" + lat + "&myLong=" + long + "&resource=" + resource);
  });

}


function combineDelays() {
  var theEtaInMinutes = convertTimeToMinutes(dbResults.etaFromMarta);
  var windowEndInMinutes = convertTimeToMinutes(firstBooking.endWindow);

  var newDelay = 30 - (windowEndInMinutes - theEtaInMinutes);
  if (dbResults.modifier) {
    newDelay += parseInt(dbResults.modifier);
  }
  dbResults.combinedDelay = newDelay;
  dbResults.newETA = convertTimeFromMinutes(theEtaInMinutes + parseInt(dbResults.modifier));

  if (g1 && context.userType === "Passenger") {
    g1.refresh(newDelay + 30);
  } else {
    gaugeSetup(newDelay + 30);
  }

  if (context.userType === "Passenger") {
    checkDelay(firstBooking.endWindow, dbResults.newETA);
  }


  console.log("theEtaInMinutes: " + theEtaInMinutes +
    " windowEndInMinutes: " + windowEndInMinutes + " newDelay:" + newDelay);
}

function changeETA(newETA){
  if (newETA.length === 5) {
    etaRef.set(newETA);
  }
}

// gauge script!

function gaugeSetup(time) {

  var theEtaInMinutes = time || convertTimeToMinutes(firstBooking.eta);
  var windowEndInMinutes = convertTimeToMinutes(firstBooking.endWindow);
  var delay = 30 - (windowEndInMinutes - theEtaInMinutes);
  var earlyTime = convertTimeFromMinutes(windowEndInMinutes - 60);

  function convertToTime() {
    return dbResults.newETA;
  }


  g1 = new JustGage({
    id: "g1",
    value: delay,
    min: 0,
    max: 60,
    minTxt: earlyTime,
    maxTxt: firstBooking["displayEndWindow"],
    textRenderer: convertToTime,
    label: "ETA",
    donut: false,
    pointer: true,
    pointerOptions: {
      toplength: -15,
      bottomlength: 10,
      bottomwidth: 12,
      color: '#222',
      stroke: '#ffffff',
      stroke_width: 3,
      stroke_linecap: 'round'
    },
    gaugeWidthScale: 0.7,
    counter: true,
    valueFontSize: 10,
    noGradient: true,
    customSectors: {
      ranges: [{
          color: "#86BAA1",
          lo: 0,
          hi: 30
        }, {
          color: "#FFCF56",
          lo: 31,
          hi: 59,
        },
        {
          color: "#F24236",
          lo: 60,
          hi: 720,
        }
      ]
    }
  });

  // mess with various gauge library defaults
  var texts = document.querySelectorAll("text");

  texts.forEach(function(element) {
    element.setAttribute("fill", "#000");
  });

  var valueLabel = document.querySelector("#g1 > svg > text:nth-child(7)");
  valueLabel.setAttribute("y", "100");

  // this works to draw the line but it seems to block gage from updating
  //document.querySelector("svg").innerHTML += '<line x1="50%" y1="0" x2="50%" y2="33" stroke="#000"></line>';
}

var turnEditing = {
  onFor(cardDiv) {
    cardDiv.classList.add("now-editing-card");
    var oldName = "no name set";

    if (cardDiv.parentElement.getAttribute("data-key") === "emergency-contacts") {
      oldName = cardDiv.querySelector(".name").textContent;

    }

    var fieldsToEdit = this.getTextFields(cardDiv);

    for (var i = 0; i < fieldsToEdit.length; i++) {
      fieldsToEdit[i].setAttribute("contenteditable", true);
      fieldsToEdit[i].setAttribute("tabindex", i);
      fieldsToEdit[i].classList.add("now-editable");
      fieldsToEdit[i].addEventListener("blur", saveToContext);

      function saveToContext() {
        var key0 = this.parentElement.parentElement.getAttribute("data-key");
        var key1 = this.getAttribute("data-text-type");
        var val = this.textContent;

        if (key0 === "saved-locations" && key1 === "short-name") {
          // some funny business here to rename the key if needed.
          delete context.dbResults[key0][key1];
          context.dbResults[key0][val] = cardDiv.querySelector(".address").textContent;
        } else if (key0 === "emergency-contacts") {
          var newName = cardDiv.querySelector(".name").textContent;
          var cell = cardDiv.querySelector(".cell").textContent;
          var email = cardDiv.querySelector(".email").textContent;

          if (key1 === "name") {
            delete context.dbResults[key0][oldName];
            context.dbResults[key0][newName] = {
              cell: cell,
              email: email
            };
          } else {
            context.dbResults[key0][oldName] = {
              cell: cell,
              email: email
            }
          }
        } else {
          context.dbResults[key0][key1] = val;
        }

        console.log(context.dbResults);
      }
    }

    cardDiv.querySelector(".done-editing").classList.remove("hidden");
    cardDiv.querySelector(".edit").classList.add("hidden");
    cardDiv.querySelector('.may-edit-text').focus();

  },

  offFor(cardDiv) {
    cardDiv.classList.remove("now-editing-card");

    var key0 = cardDiv.parentElement.getAttribute("data-key");
    database.ref(key0).set(context.dbResults[key0]);
    var fieldsToEdit = this.getTextFields(cardDiv);
    for (var i = 0; i < fieldsToEdit.length; i++) {
      fieldsToEdit[i].removeAttribute("contenteditable");
      fieldsToEdit[i].removeAttribute("tabindex");
      fieldsToEdit[i].classList.remove("now-editable");
    }

    cardDiv.querySelector(".done-editing").classList.add("hidden");
    cardDiv.querySelector(".edit").classList.remove("hidden");


    console.log("turning off editing");
  },
  getTextFields(cardDiv) {
    textFields = [].slice.call(cardDiv.querySelectorAll(".may-edit-text"));
    return textFields;
  }

}

if (document.querySelector('select[name=user-type]')){
  context["userType"] = document.querySelector('select[name=user-type]').value;
}

if ( document.querySelector('.menu-open')) {
  addStartingListeners();
}

// when all else is done...
if (document.querySelector(".form-wrapper")) {
  document.querySelector(".form-wrapper").classList.add("show");
}
