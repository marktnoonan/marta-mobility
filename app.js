var context = {}; // context object holds data accessible to handlebars
var firstBooking = null;
var bell = null;

document.querySelector('#login').addEventListener('click', function() {
  var username = document.querySelector('input[name=providedUsername]').value;
  var password = document.querySelector('input[name=providedPassword]').value;

  getTrips(username, password);

});


document.querySelector('#pw').addEventListener('keyup', function(event) {
  if (event.keyCode == 13) {
    var username = document.querySelector('input[name=providedUsername]').value;
    var password = document.querySelector('input[name=providedPassword]').value;

    getTrips(username, password);

  }
});


function getTrips(username, password) {
  document.querySelector('#output').innerHTML = '<center><div id="spinner"></div></center>';

  return new Promise(function(resolve, reject) {

    var xhr = new XMLHttpRequest();
    xhr.open('POST', "martasimplehtmldom.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
      if (xhr.readyState == 4 && xhr.status === 200) {


        resolve(addMartaDataToDom(xhr.responseText));


      } else {

        reject(Error('Request failed, status was ' + xhr.statusText));

      }
    };
    xhr.send("providedUsername=" + username + "&providedPassword=" + password);
  });

}

function addMartaDataToDom(xhrResponse) {

  var proceed = true;

  // my first ever try/catch & I'm definitely doing it wrong ;)
  try {
    context['dataFromMarta'] = JSON.parse(xhrResponse);
  } catch (err) {
    console.log("error: " + err);
    proceed = false;
  }

  if (proceed) {
    pushHandlebars();
    document.querySelector('#unpw-form').classList.add("hidden");
    document.querySelector('#login').classList.add("hidden");
  } else {
    document.querySelector('#output').innerHTML = '<br><br><Br><span style="color:#ff7e72">Client ID or password not found.</span>';
  }

}

function pushHandlebars() {
  window.scrollTo(0, 0);
  var source = document.querySelector("#entry-template").innerHTML;
  var template = Handlebars.compile(source);
  var html = template(context);
  document.querySelector('#output').innerHTML = html;

  firstBooking = context.dataFromMarta[0].bookings[0];
  checkDelay(firstBooking.endWindow, firstBooking.eta);
  addListeners();
  gaugeSetup();
}

function addListeners() {

 bell = document.querySelector('.bell');

  document.querySelector('#refresh').addEventListener('click', function() {
    var username = document.querySelector('input[name=providedUsername]').value;
    var password = document.querySelector('input[name=providedPassword]').value;

    getTrips(username, password);

  });

  for (var i = 0; i < context.dataFromMarta[0].bookings.length; i++) {

    var detailsID = "#details" + i;
    var locationsID = "#locations" + i;
    (function handleDetails(detailsID, locationsID) {
      document.querySelector(detailsID).addEventListener("click", function() {
        if (document.querySelector(locationsID).style.display !== "block") {
          this.innerHTML = '<i class="fa fa-chevron-up" aria-hidden="true"></i>';
          document.querySelector(locationsID).style.display = "block";

        } else {
          this.innerHTML = '<i class="fa fa-chevron-down" aria-hidden="true"></i>';
          document.querySelector(locationsID).style.display = "none";
        }
      });
    })(detailsID, locationsID); // this weird IIFE patter locks in the "i" from the iterator.

  }
}




function checkDelay(windowEnd, eta) {

  var etaField = document.querySelector('.eta');
  var lateSatusField = document.querySelector('span.late-status');
  var bookedTracker = document.querySelector('.booked');
  var fiveMinuteTracker = document.querySelector('.five-minutes');
  var scheduledTracker = document.querySelector('.scheduled');
  var tripSoonTracker = document.querySelector('.trip-soon');
  var hereNowTracker = document.querySelector('.here-now');

  var now = new Date(); // for now
  var nowInMinutes = (now.getHours()*60) + now.getMinutes();

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
  console.log(timeFromNow);

  if (timeFromNow <= 5  && timeFromNow > 0) {
    completeStep(fiveMinuteTracker, "5 min. away");
  }

  if (timeFromNow <= 30 && timeFromNow > 0) {
    completeStep(tripSoonTracker, "30 min. away");
  }

  if (timeFromNow <= 0 && timeFromNow > -10) {
    completeStep(hereNowTracker, "Arriving now!");

  }


  if (theEtaInMinutes > windowEndInMinutes) {
//        etaField.style.backgroundColor = "#ff7e72";
    lateSatusField.textContent = ", running late.";

  } else if (theEtaInMinutes <= windowEndInMinutes && windowEndInMinutes - theEtaInMinutes < 30) {
//        etaField.style.backgroundColor = '#f8efc0';
    lateSatusField.textContent = ", arriving in window.";
  } else {
//        etaField.style.backgroundColor = 'darkseagreen';
    lateSatusField.textContent = ", arriving on time.";
  }


}

function completeStep(trackerElement, requiredText) {
  trackerElement.classList.remove('future-step');
  trackerElement.classList.add('complete');
  trackerElement.setAttribute('data-text', requiredText);

  if (requiredText === "Arriving now!") {
    bell.classList.add('bell-shake');
  }

}

function convertTimeToMinutes(time) {

  var timeInMinutes = time.split(":");
  timeInMinutes = (timeInMinutes[0] * 60) + parseInt(timeInMinutes[1]);
  return timeInMinutes;
}

// guage script!
var g1; // global for development

function gaugeSetup() {


var theEtaInMinutes = convertTimeToMinutes(firstBooking.eta);
var windowEndInMinutes = convertTimeToMinutes(firstBooking.endWindow);
var delay = 30 - (windowEndInMinutes - theEtaInMinutes);

var timeType = "PM";

function convertToTime(){
return "ETA: " + firstBooking["displayEta"];
}


g1 = new JustGage({
  id: "g1",
  value: delay,
  min: 0,
  max: 30,
  minTxt: firstBooking["displayReadyTime"],
  maxTxt: firstBooking["displayEndWindow"],
  textRenderer: convertToTime,
  donut: false,
  pointer: true,
  gaugeWidthScale: 0.7,
  counter: true,
  valueFontSize: 10,
  noGradient: true,
  customSectors: {
    ranges: [{
        color: "#B2C0AC",
        lo: 0,
        hi: 5
      }, {
        color: "#F8EFC0",
        lo: 6,
        hi: 29,
      },
      {
        color: "#ff3b30",
        lo: 30,
        hi: 720,
      }
    ]
  }
});


}
