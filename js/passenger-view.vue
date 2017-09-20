<template>
    <div>
        <app-header></app-header>
        <div class="main">
            <div>
                <div class="client-info text-align-center">
                    Hi
                    <b>{{userInfo.clientName}}!</b>
                </div>
            </div>
            <br>
            <h2>Your Next Trip</h2><br>
            <div v-for="(booking, index) in userInfo.bookings" class="booking" :id="'booking' + index">
                <passenger-booking :booking="booking" :idx="index"></passenger-booking>
            </div>
        </div>
    </div>
</template>

<script>
import PassengerBooking from './passenger-booking.vue';
import AppHeader from './header.vue';

export default {
    components: {
        PassengerBooking,
        AppHeader
    },
    data: function() {
        return {}
    },
    props: ['userInfo'],
    methods: {

    }
}
</script>

<style>

</style>
