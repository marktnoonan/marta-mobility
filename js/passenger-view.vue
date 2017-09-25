<template>
    <div>
        <app-header @info-event="handleInfoEvent" @reports-event="handleReportEvent"></app-header>
        <my-info v-if="showInfo" :user-info="userInfo.fbUserInfo" :user-contacts="userContacts" :user-locations="userLocations" @info-event="handleInfoEvent"></my-info>
        <my-reports v-if="showReports" :reports="userReports" @reports-event="handleReportEvent"></my-reports>
        <div class="main">
            <div>
                <div class="client-info text-align-center">
                    Hi
                    <b>{{userInfo.clientName}}!</b>
                </div>
            </div>
            <br>
            <h2>Your Next Trip</h2><br>
            <!-- <div v-for="(booking, index) in userInfo.bookings" class="booking" :id="'booking' + index">
                <passenger-booking :booking="booking" :idx="index"></passenger-booking>
            </div> -->
            <div class="booking" :id="'booking0'">
                <passenger-booking :booking="userInfo.bookings[0]" :idx="0" :trip-info="tripInfo"></passenger-booking>
            </div>
        </div>
        <report-form v-if="showReportForm" v-on:help-event="handleHelpEvent($event)" :help-report="helpReport"></report-form>
        <bottom-menu v-on:help-event="handleHelpEvent($event)"></bottom-menu>
    </div>
</template>

<script>
import PassengerBooking from './passenger-booking.vue';
import AppHeader from './header.vue';
import BottomMenu from './bottom-menu.vue';
import ReportForm from './report-form.vue';
import MyInfo from './my-info.vue';
import MyReports from './my-reports.vue';

export default {
    components: {
        PassengerBooking,
        AppHeader,
        BottomMenu,
        ReportForm,
        MyInfo,
        MyReports
    },
    data: function() {
        return {
            showReportForm: false,
            helpReport: {},
            showInfo: false,
            showReports: false,
        }
    },
    props: ['tripInfo', 'userInfo', 'userReports', 'userContacts', 'userLocations'],
    methods: {
        handleHelpEvent: function($event) {
            this.showReportForm = !this.showReportForm;
            this.helpReport = $event;
        },
        handleInfoEvent: function() {
            this.showInfo = !this.showInfo;
            if (this.showInfo) {
                this.showReportForm = false;
                this.showReports = false;
            }
        },
        handleReportEvent: function() {
            this.showReports = !this.showReports;
            if (this.showReports) {
                this.showReportForm = false;
                this.showInfo = false;
            }
        }
    }
}
</script>

<style>

.client-info {
  padding-top: 8px;
  margin-bottom: 4px;
  padding-bottom: 0;
}

h2 {
  margin-bottom: 0;
  margin-top: 0;
  display: block;
  font-size: 1.2rem;
  flex-grow: 2;
}

</style>
