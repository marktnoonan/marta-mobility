<template>
    <div class="ready-time-gauge gauge-container">
        <div :id="div_id" v-gauge="gaugeVars"></div>
    </div>
</template>


<script>
export default {
    directives: {
        gauge: {
            inserted: function(el, binding) {
                var id = el.id;
                var vals = binding.value;
                var convertToTime = function() {
                    return vals.newEta;
                };
                new JustGage({
                    id: id,
                    value: vals.delay,
                    min: 0,
                    max: 60,
                    maxTxt: vals.maxTime,
                    minTxt: vals.minTime,
                    textRenderer: convertToTime,
                    label: "ETA",
                    donut: false,
                    pointer: true,
                    pointerOptions: {
                        toplength: -15,
                        bottomlength: 10,
                        bottomwidth: 12,
                        color: '#222',
                        stroke: '#ffffff',
                        stroke_width: 3,
                        stroke_linecap: 'round'
                    },
                    gaugeWidthScale: 0.7,
                    counter: true,
                    valueFontSize: 10,
                    noGradient: true,
                    customSectors: {
                        ranges: [{
                            color: "#86BAA1",
                            lo: 0,
                            hi: 30
                        }, {
                            color: "#FFCF56",
                            lo: 31,
                            hi: 59,
                        },
                        {
                            color: "#F24236",
                            lo: 60,
                            hi: 720,
                        }
                        ]
                    }
                });
            }
        }
    },
    computed: {
        gaugeVars: function() {
            return {
                time: this.time,
                minTime: this.minTime,
                maxTime: this.maxTime,
                delay: this.delay,
                newEta: this.newEta
            };
        },
        div_id: function() {
            return "justGageDiv" + Math.floor(Math.random() * 5000);
        }
    },
    props: ['time', 'minTime', 'maxTime', 'delay', 'newEta'],
}
</script>

<style scoped>
.ready-time-gage {
  font-size: 12px;
  margin-bottom: 8px;
}

/*extremely fragile selector that will need to be updated if the SVG text
elements change again*/

svg>text:nth-child(7) {
  font-size: 16px !important;
}

text+text {
  font-size: 12px !important;
}

svg {
  position: relative;
}

.gauge-container {
  margin: 0 auto;
  margin-top: -10px;
  text-align: center;
}

</style>
