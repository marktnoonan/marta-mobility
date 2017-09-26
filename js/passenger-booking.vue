<template>
  <div class="container booking">
    <div class="date-and-id" :id="'date-and-id' + idx">
      <span class="display-date">{{booking.displayDate}}</span>
      <span class="date">{{booking.date}}</span>
    </div>
    <div class="ready-time-gage">{{booking.displayReadyTime}}</div>
    <passenger-gauge :time="booking.eta" :min-time="earlyTime" :max-time="booking.displayEndWindow" :delay="delay" :eta="newEta"></passenger-gauge>
    <span class="ready-time">
      <b>Start Window</b>: {{booking.displayReadyTime}}</span>
    <span class="ready-time">
      <b>End Window</b>: {{booking.displayEndWindow}}</span>
    <pizza-tracker :completed-steps="steps"></pizza-tracker>
    <div class="booking-status">
      <b>Trip Status</b>: {{this.booking.Status}}<span class="late-status">{{lateStatusText}}</span>
    </div>
    <div class="times">
      <center>
        <div class="eta" v-if="booking.displayEta" :class="{'no-eta': booking.eta}">
          <i class="fa fa-clock-o fa-lg"></i>
          <b>ETA</b>: {{booking.displayEta}}
        </div>
        <div v-else>
          No van is scheduled for this trip.
        </div>
        </span>
      </center>
    </div>
    <div class="locations" :id="'locations' + idx">
      <span class="booking-id">
        <b>Booking ID</b>: {{booking.bookingID}}</span>
      <div class="pickup">
        <b>From</b>: {{booking.pickupAddress}}</div>
      <div class="dropoff">
        <b>To</b>: {{booking.dropOffAddress}}</div>
    </div>
  </div>
</template>

<script>
import PizzaTracker from './pizza-tracker.vue';
import PassengerGauge from './passenger-gauge.vue';

export default {
  components: {
    PizzaTracker,
    PassengerGauge
  },
  props: ['booking', 'idx', 'tripInfo'],
  computed: {
    windowEndInMinutes: function() {
      return this.convertTimeToMinutes(this.booking.endWindow);
    },
    earlyTime: function() {
      return this.convertTimeFromMinutes(this.windowEndInMinutes - 60);
    },
    delay: function() {
      var eta = (this.tripInfo.eta ? this.tripInfo.eta[".value"] : this.booking.eta);
      return (this.convertTimeToMinutes(eta) - (this.windowEndInMinutes - 60));
    },
    newEta: function() {
      var eta;
      if (this.tripInfo.eta) {
        eta = this.convertTimeToMinutes(this.tripInfo.eta[".value"]);
      } else {
        eta = this.convertTimeToMinutes(this.booking.eta);
      }
      if (this.tripInfo.modifier) {
        eta = eta + Number(this.tripInfo.modifier[".value"]);
      }
      return this.convertTimeFromMinutes(eta);
    },
    steps: function() {
      var ret = {};
      ret.booked = true;
      var now = new Date();
      var nowInMinutes = (now.getHours() * 60) + now.getMinutes();

      if (!this.booking.eta) {
        return;
      }
      ret.scheduled = true;
      var timeFromNow = this.convertTimeToMinutes(this.booking.eta) - nowInMinutes;
      if (timeFromNow <= 5 && timeFromNow > 0) {
        ret.five_minutes = true;
      }
      if (timeFromNow <= 30 && timeFromNow > 0) {
        ret.trip_soon = true;
      }
      if (timeFromNow <= 0 && timeFromNow > -10) {
        ret.here_now = true;
      }
      return ret;
    },
    lateStatusText: function() {
      var ret = '';
      var now = new Date();
      var nowInMinutes = (now.getHours() * 60) + now.getMinutes();
      var theEtaInMinutes = this.convertTimeToMinutes(this.booking.eta);

      if (theEtaInMinutes > this.windowEndInMinutes) {
        ret = ", running late.";
      } else if (theEtaInMinutes <= this.windowEndInMinutes && this.windowEndInMinutes - theEtaInMinutes < 30) {
        ret = ", arriving in window.";
      } else {
        ret = ", arriving on time.";
      }
      return ret;
    }
  },
  methods: {
    convertTimeToMinutes: function(time) {
      var timeInMinutes = time.split(":");
      timeInMinutes = (timeInMinutes[0] * 60) + parseInt(timeInMinutes[1]);
      return timeInMinutes;
    },
    convertTimeFromMinutes: function(minutes) {
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

  }
}
</script>

<style scoped>
.booking {
  background-color: #ffffff;
  margin-bottom: 20px;
  padding-bottom: 0;
  border: 1px solid #87AFB5;
  border-radius: 4px;
  line-height: 2;
}

.booking-status {
  margin-bottom: 10px;
}

.container {
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
  background-color: #fff;
}

div.eta {
  padding: 4px 10px 2px 10px;
  display: inline-block;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  margin: 6px;
  display: none;
}

.display-date {
  font-size: 1.3em;
}

span.date {
  font-size: 1.3em;
  float: right;
}

div.date-and-id {
  text-align: left;
  margin-bottom: 4px;
  background-color: #dedede;
  background-image: linear-gradient(to bottom, #f5f5f5 0, #52A7B4 80%);
  padding: 2px 10px 2px 10px;
  border-bottom: 1px solid #ddd;
}

.ready-time {
  display: inline-block;
  display: none;
}

div.locations {
  text-align: left;
  padding-left: 4px;
}

.no-eta {
  background-color: "lightblue";
}

.ready-time-gage {
  font-size: 12px;
  margin-bottom: 8px;
}
</style>
