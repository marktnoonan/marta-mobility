<template>
    <div class="make-report">
        <!--         <span class="closer" alt="cancel" v-on:click="hideReportForm($event)">×</span> -->
        <button class="closer" alt="cancel" v-on:click="hideReportForm($event)">X</button>
        <h1 id="report-category"></h1>
        <span id="action-specific-text">We have alerted your emergency contacts </span>
        <span v-html="helpReport.text"></span>
        <form class="make-report-form">
            <b>Add to report:</b><br><br>
            <center>
                <textarea name="what-happened" v-model="helpReport.comments"></textarea><br><br>
                <button type="button" name="submit-report" v-on:click="completeReport($event)">Complete Report</button>
            </center>
        </form>
    </div>
</template>


<script>
export default {
    props: ['helpReport'],
    methods: {
        hideReportForm: function($event) {
            this.$emit('help-event', $event);
        },
        completeReport: function($event) {
            if (navigator.geolocation) {
                var vm = this;
                navigator.geolocation.getCurrentPosition(
                    function(res) {
                        vm.helpReport.location = {
                            'latitude': res.coords.latitude,
                            'longitude': res.coords.longitude
                        };
                        vm.$emit('complete-report', vm.helpReport);
                        vm.$emit('help-event');
                    },
                    function(err) {
                        vm.$emit('complete-report', vm.helpReport);
                        vm.$emit('help-event');
                    }
                );
            } else {
                this.$emit('complete-report', this.helpReport);
                this.$emit('help-event');
            }
        }
    }
}
</script>

<style scoped>
.make-report {
    display: block;
    position: absolute;
    margin: 0;
    margin-top: 45px;
    top: 0;
    left: 0;
    padding: 20px;
    background-color: #52A7B4;
    color: #111;
    transition: opacity 600ms ease-in-out;
    min-height: 100vh;
    text-align: left;
    z-index: 900;
    width: 100%;
}

.make-report-form {
    margin-top: 15px;
}

textarea {
    width: 240px;
    height: 150px;
}

.closer {
    padding: 0;
    font-size: 2em;
    cursor: pointer;
    transition: all 100ms ease-in;
    color: #000;
    transform: scale(1.1);
    position: fixed;
    right: 12px;
    text-shadow: 0 0 5px #fff;
    background: inherit;
    padding-left: 6px;
    padding-bottom: 6px;
    border: 0;
}
</style>
