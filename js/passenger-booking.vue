<template>
  <div>
    <div class="date-and-id" :id="'date-and-id' + idx">
      <span class="display-date">{{booking.displayDate}}</span>
      <span class="date">{{booking.date}}</span>
    </div>
    <div class="ready-time-gage">{{booking.displayReadyTime}}</div>
    <div class="gauge-container">
      <div id="g1" class="gauge"></div>
    </div>
    <span class="ready-time">
      <b>Start Window</b>: {{booking.displayReadyTime}}</span>
    <span class="ready-time">
      <b>End Window</b>: {{booking.displayEndWindow}}</span>
    <pizza-tracker></pizza-tracker>
    <div class="booking-status">
      <b>Trip Status</b>: {{booking.Status}}
      <span class="late-status"></span>
    </div>
    <div class="times">
      <center>
        <div class="eta" v-if="booking.displayEta">
          <i class="fa fa-clock-o fa-lg"></i>
          <b>ETA</b>: {{booking.displayEta}}
        </div>
        <div v-else>
          No van is scheduled for this trip.
        </div>
        <!-- Not using this right now while we are just displaying one trip.
          <span :id="'details' + idx" class="more-details"><i class="fa fa-chevron-down" aria-hidden="true"></i> -->
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

export default {
  components: {
    PizzaTracker
  },
  props: ['booking', 'idx'],
  data: function() {
    return {}
  },
  methods: {

  }
}
</script>
