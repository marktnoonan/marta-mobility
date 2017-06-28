$(document).ready(function(){

$.ajaxSetup({ cache: false });
checkTime();

var checkOften = setInterval(checkTime, 5000);

var newTime = "";
var windowEnd = "07:25";
var newTimeInMinutes = "";
var windowEndInMinutes = "445";


function checkTime(){
    $.ajax({url: "marta.json", success: function(result){

        newTime = result["bookings"][0]["eta"];
        newTimeInMinutes = newTime.split(":");
        newTimeInMinutes = (newTimeInMinutes[0] * 60) + parseInt(newTimeInMinutes[1]);


        if(newTimeInMinutes > windowEndInMinutes) {
        $('#currETA').text(newTime);
        $('#currETA').css('background-color','red');
        $('#status').css('color','red');
        $('#statusText').text('Delayed');
        }

        else if(newTimeInMinutes <= windowEndInMinutes && windowEndInMinutes - newTimeInMinutes < 30) {
        $('#currETA').text(newTime);
        $('#currETA').css('background-color','#ffd32a');
        $('#currETA').css('color','#000');
        $('#status').css('color','red');
        $('#statusText').text('In Window');
        }

        else {
          console.log(newTimeInMinutes - windowEndInMinutes);
          $('#currETA').text("06:55");
          $('#currETA').css('background-color','green');
          $('#statusText').text('On Time');
        }


    }});

}

$("#update").click(checkTime);



console.log("hey there");


});
