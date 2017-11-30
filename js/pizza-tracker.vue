<template>
  <div class="pizza-tracker">
    <div v-for="(step, step_id) in steps" :class="[step_id, getSteps(step_id)]" :data-text="step.text">
      <div class="straighten">
        <i :class="['fa', 'fa-lg', 'fa-' + step.icon]"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      'steps': {
        'booked': { status: false, icon: 'calendar', text: 'Booked' },
        'scheduled': { status: false, icon: 'ticket', text: 'Van Assigned' },
        'trip_soon': { status: false, icon: 'road', text: '30 min. Away' },
        'five_minutes': { status: false, icon: 'clock-o', text: '5 min. Away' },
        'here_now': { status: false, icon: 'bell', text: 'Arriving Now!' }
      }
    };
  },
  props: ["completedSteps"],
  methods: {
    markStepComplete: function(step) {
      this.steps[step] = true;
    },
    getSteps: function(step_id) {
      var classes = [];
      if (typeof (this.completedSteps[step_id]) !== 'undefined') {
        classes = ['complete'];
        if (step_id == 'here_now') {
          classes.push('bell-shake');
        }
      } else {
        classes = ['future-step'];
      }
      return classes;
    }
  },
}
</script>

<style scoped>
.pizza-tracker {
  position: relative;
  margin-bottom: 40px;
}

.pizza-tracker>div {
  position: static;
  bottom: 0;
  width: auto;
  background-color: #eee;
  border: 1px solid rgba(0, 0, 0, 0.2);
  display: inline-block;
  padding: 8px 16px;
  margin-left: 0;
  margin-right: -1px;
  transform: skewX(-20deg);
  margin-bottom: 4px;
  color: rgba(0, 0, 0, 0.3);
}

.pizza-tracker>div::after {
  position: absolute;
  box-sizing: border-box;
  transform: skewX(20deg);
  height: 12px;
  font-size: 10px;
  font-weight: 700;
  content: '';
  line-height: normal;
  width: 100%;
  padding-top: 4px;
  border-top: 2px solid #ddd;
  bottom: -18px;
  left: 3px;
}

.pizza-tracker>div:nth-child(1) {
  border-radius: 4px 0 0 4px;
}

.pizza-tracker>div:last-child {
  border-radius: 0 4px 4px 0;
}

.straighten {
  display: inline-block;
  transform: skewX(20deg);
}

.pizza-tracker>.complete {
  background-color: darkseagreen;
  background-image: linear-gradient(to bottom, #C3DDD0 0, #86BAA1 100%);
  box-shadow: 0 0 0px 1px #b2dba1;
  color: #000;
}

.pizza-tracker>.complete::after {
  position: absolute;
  box-sizing: border-box;
  transform: skewX(20deg);
  height: 12px;
  font-size: 10px;
  font-weight: 700;
  content: attr(data-text);
  line-height: normal;
  width: 100%;
  padding-top: 4px;
  border-top: 2px solid #444;
  bottom: -18px;
  left: 3px;
}

.more-details {
  opacity: 0.6;
  display: block;
  background-color: #efefef;
}

.pizza-tracker>.working {
  background-color: #cec;
  background-image: linear-gradient(to bottom, #fcf8e3 0, #FFCF56 100%);
}

.pizza-tracker>.future-step {
  background-image: linear-gradient(to bottom, #fcf8e3 0, #FFCF56 100%);
}

.status-text {
  font-size: 10px;
  font-weight: 700;
}

i {
  display: block;
}

.bell {}

.bell-shake {
  display: block;
  animation: ring 1s infinite alternate;
}

@keyframes ring {
  0% {
    transform: rotate(-10deg);
  }
  33% {
    transform: rotate(10deg);
  }
  66% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-10deg);
  }
}
</style>
