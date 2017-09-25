<template>
    <div>
        <h1> Dispatcher </h1>
        <div class="driver-info">
            <h3>Active trip for {{dataFromMarta[0].clientName}}</h3>
            <br> Date: {{dataFromMarta[0].bookings[0].date}}
            <br> Passenger Ready Time: {{dataFromMarta[0].bookings[0].displayReadyTime}}
            <br> Stored ETA: {{dataFromMarta[0].bookings[0].displayEta}}
            <br> Pick Up At: {{dataFromMarta[0].bookings[0].pickupAddress}}
            <br> Drop Off At: {{dataFromMarta[0].bookings[0].dropOffAddress}}
            <br>
            <br>
            <h2>Trip info</h2>
            <br>
            <b>Live Marta ETA</b>:
            <input type="text" class="eta-from-db" value="{{dbResults.etaFromMarta}}" onchange="changeETA(this.value)"></input>
            <br>Edit as needed, please keep format HH:MM military time :)<br><br>
            <b>Paratransit Pal Delay Modifier</b>:
            <span class="modifier-from-db">{{dbResults.modifier}} minutes extra delay</span>
            <br><br>Modifier is calculated based on live node data and historical factors, if available. ETA shown to users is a combination of these two pieces of information.
        </div>
    </div>
</template>

<script>
export default {
    props: ["dataFromMarta"]
}
</script>

<style>

</style>
