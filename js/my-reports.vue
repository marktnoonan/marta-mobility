<template>
    <section class="my-reports">
        <button class="closer" alt="cancel" @click="hideReports()">X</button>
        <h1>My Reports</h1>
        <div v-for="report in reports" class="card">
            <div class="report-header">
                <span class="report-icon" :class="getIconClass(report)">{{report.iconString}}</span> "
                <b>{{report.category}}</b>", report generated on
                <br> {{report.prettyTime}}
            </div>
            <div v-if="report.comments">
                <span class="info-label">Comments</span>
                <div class="report-info">{{report.comments}}</div>
            </div>
            <span class="info-label">Location</span>
            <div class="report-info">Near {{report.prettyAddress}}<br>
                <div v-if="report.location">(exact location: {{report.location.latitude}}, {{report.location.longitude}})</div>
            </div>
            <div v-if="report.nodedata">
                <span class="info-label">Nearby Nodes</span>
                <div class="report-info" v-for="(val, key) in getNodeData(report.nodedata)">
                    <div> {{val.envAssetUid}}</div>
                    <span class="info-label">Traffic Speed</span>
                    <div class="report-info">{{val.vehicleSpeed}} mph</div>
                    <span class="info-label">Nearby Vehicles</span>
                    <div class="report-info">{{val.vehicleCount}}</div>
                </div>
            </div>

        </div>
    </section>
</template>

<script>
export default {
    props: ["reports"],
    methods: {
        hideReports: function() {
            this.$emit('reports-event');
        },
        getIconClass: function(report) {
            switch (report.category) {
                case 'I am lost': return ['fa', 'fa-map-marker', 'fa-2x']; break;
                default: return ['fa', 'fa-info-circle', 'fa-2x']; break;
            }
        },
        getNodeData: function(node) {
            if (typeof (node) !== 'undefined') {
                return JSON.parse(node);
            } else {
                return null;
            }
        }
    }
}
</script>

<style scoped>
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

.card {
    padding: 10px;
    background-color: #f5f5f5;
    margin-bottom: 10px;
    line-height: 1.6;
    border-radius: 4px;
    box-shadow: 1px 1px 2px 0 rgba(0, 0, 0, 0.5)
}

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


.make-report,
.my-info-output {
    display: block;
    position: absolute;
    margin: 0;
    margin-top: 45px;
    top: 0;
    left: 0;
    padding: 20px;
    background-color: #52A7B4;
    color: #111;
    opacity: 0;
    pointer-events: none;
    transition: opacity 600ms ease-in-out;
    min-height: 100vh;
    text-align: left;
    z-index: 300;
    width: 100%;
}

.make-report-form {
    margin-top: 15px;
}

.report-link {
    font-weight: bold;
}

.my-reports {
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
    z-index: 300;
    width: 100%;
}
</style>
