<template>
  <div class="pizza-tracker">
    <div class="booked future-step" data-text="">
      <div class="straighten"><i class="fa fa-calendar fa-lg"></i>
      </div>
    </div>
    <div class="scheduled future-step" data-text="">
      <div class="straighten"><i class="fa fa-ticket fa-lg"></i>
      </div>
    </div>
    <div class="trip-soon future-step" data-text="">
      <div class="straighten"><i class="fa fa-road fa-lg"></i>
      </div>
    </div>
    <div class="five-minutes future-step" data-text="">
      <div class="straighten"><i class="fa fa-clock-o fa-lg"></i>
      </div>
    </div>
    <div class="here-now future-step" data-text="">
      <div class="straighten">\
        <div class="bell"><i class="fa fa-bell-o fa-lg"></i></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: function() {
        return {};
    },
    methods: {
        markStepComplete: function(step) {
            
        }
    }
}
</script>
