<template>
    <div class="bottom-menu" :class="{'hidden': !menu, 'bottom-menu-display': menu}">
        <span class="bottom-show-menu-link" v-on:click="showMenu()">Help
        </span>
        <a href="tel:1-678-488-3081">
            <div class="emergency" data-action="Call 911">
                <i class="fa fa-ambulance fa-lg" aria-hidden="true"></i> 911 EMERGENCY
            </div>
        </a>
        <div class="bottom-menu-item" data-action="lost" v-on:click="emitHelp($event)">
            <i class="fa fa-map-marker fa-2x" aria-hidden="true"></i> <br><br>I am
            <b>LOST</b>
        </div>
        <div class="bottom-menu-item" data-action="help" v-on:click="emitHelp($event)">
            <i class="fa fa-flag fa-2x" aria-hidden="true"></i><br><br>I need
            <b>HELP</b>
        </div>
        <div class="bottom-menu-item" data-action="incident" v-on:click="emitHelp($event)">
            <i class="fa fa-info-circle fa-2x" aria-hidden="true"></i><br><br>Report
            <b>INCIDENT</b>
        </div>
        <div class="bottom-menu-item" data-action="crime" v-on:click="emitHelp($event)">
            <i class="fa fa-gavel fa-2x" aria-hidden="true"></i><br><br>Report
            <b>CRIME</b>
        </div>
    </div>
</template>

<script>
const helpTexts = {
    'lost' : "that you are lost. Get directions to: <ol> <li>A saved location</li><li>Your last drop-off location</li><li>Your next pickup location</li><li>Local police</li></ol>",
    "help" : "that you need help. You may wish to: <ol><li>Call 911</li><li>Get Directions</li></ol>",
    "incident" : "that you are reporting an incident. ",
    "crime" : "that you are reporting a crime. "
};


export default {
    data: function() {
        return {
            menu: false
        }
    },
    methods: {
        showMenu: function() {
            this.menu = !this.menu;
        },
        emitHelp: function($event) {
            this.menu = !this.menu;
            this.$emit('help-event', {text: helpTexts[$event.currentTarget.dataset.action]});
        }
    }
}
</script>

<style scoped>
.bottom-show-menu-link {
  color: #111;
  font-size: 1.5em;
  position: inherit;
  transform: translate(-50%, -50px);
  background-color: #52A7B4;
  height: 90px;
  width: 90px;
  padding: 9px;
  border-radius: 50px;
  z-index: -1;
  font-weight: bold;
  cursor: pointer;
}

.bottom-menu {
  color: #000;
  padding-top: 10px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  background-color: #52A7B4;
  background-image: linear-gradient(to bottom, #52A7B4 50%, #f8f8f8 100%);
  transform: translateY(288px);
  transition: transform .4s ease-out;
}

.bottom-menu-display {
  transform: translate(0);
  transition: transform .4s ease-out;
}

.bottom-menu-item, .driver-delay-option {
  height: 40%;
  width: 40%;
  display: inline-block;
  margin: 10px;
  padding: 16px 5px;
  border-radius: 4px;
  background-color: #fff;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), #C9D9F1);
  cursor: pointer;
}

.bottom-menu-item:hover, .emergency:hover{
  background-color: #dff0d8;
}

.emergency {
  width: 85%;
  border: 3px solid #F24236;
  padding: 10px;
  font-size: 1.5em;
  margin: auto;
  background-color: #fff;
  border-radius: 4px;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), #C9D9F1);
  cursor: pointer;
}


/* end bottom menu styles */


/* report and dropdown styles */

.report-header {
  margin-bottom: 4px;
  padding: 4px;

}

.comments-container {
  margin-bottom: 4px;
  padding-bottom: 8px;
}

.report-info {
  border: 1px solid #777;
  padding: 4px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 6px;

}

.report-icon {
  text-align: center;
  float: left;
  margin-right: 10px;
  margin-top: 1px;
  border: 1px solid #555;
  width: 46px;
  padding: 5px 0 4px 0;
  border-radius: 4px;
  background-color: #fff;
}

</style>
