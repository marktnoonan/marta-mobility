<template>
    <div>
        <div class="driver-info">
            <br>
            <h1>Driver View</h1>
            <h2>Your Next Pickup</h2>
            <br> Passenger: {{dataFromMarta[0].clientName}}
            <br> Date: {{dataFromMarta[0].bookings[0].date}}
            <br> Pick Up At {{dataFromMarta[0].bookings[0].pickupAddress}}
            <br> Drop Off At: {{dataFromMarta[0].bookings[0].dropOffAddress}}<br>
            <hr>
            <div class="driver-times">
                <div class="driver-time">
                    <b>Ready Time</b><br> {{displayReadyTime}}
                </div>
                <div class="driver-time">
                    <b>Pickup ETA</b><br> {{displayEta}}
                </div>
            </div>
            <hr>
            <h2>Add a Delay</h2>
            <div class="driver-delay-options">
                <div class="driver-delay-option" data-action="SMALL">
                    Small
                </div>
                <div class="driver-delay-option" data-action="MEDIUM">
                    Medium
                </div>
                <div class="driver-delay-option" data-action="LARGE">
                    Large
                </div>
                <div class="driver-delay-option" data-action="MAJOR">
                    Major
                </div>
            </div>

        </div>
    </div>
</template>

<script>
export default {
    props: ["dataFromMarta"]
}
</script>

<style>
.driver-info {
    text-align: left;
}

.driver-delay-option {
    border: 1px solid #666;
    text-align: center;
    font-weight: bold;
}

.driver-times {
    margin-top: 10px;
    margin-bottom: 10px;
    text-align: center;
}

.driver-time {
    display: inline-block;
    width: 45%;
    background-color: #c7b350;
    padding: 5px 0px;
}
</style>
