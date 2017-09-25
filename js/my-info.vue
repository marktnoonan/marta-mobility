<template>
    <div class="my-info-output">
        <button class="closer" alt="cancel" @click="hideInfo()">X</button>
        <h1>My Information</h1>
        <section>
            <h2>About Me</h2>
            <br>
            <info-section @done-editing="updateInfo">
                <label class="info-label">Name</label>:
                <input type="text" class="may-edit-text name" v-model="userInfo.name"></input><br>
                <label class="info-label">Cell Number</label>:
                <input type="text" class="may-edit-text cell" v-model="userInfo.cell"></input><br>
                <label class="info-label">Email</label>:
                <input type="text" class="may-edit-text email" v-model="userInfo.email"></input><br>
                <label class="info-label">Tracking</label>:
                <input type="text" class="may-edit tracking" v-model="userInfo.track"></input>
            </info-section>
        </section>
        <br>
        <section data-key="emergency-contacts">
            <h2>Emergency Contacts</h2>
            <br>
            <div v-for="contact in userContacts" class="card">
                <info-section @done-editing="updateContacts">
                    <label class="info-label">Name</label>:
                    <input type="text" class="may-edit-text name" v-model="contact.name"></input><br>
                    <label class="info-label">Cell Number</label>:
                    <input type="text" class="may-edit-text cell" v-model="contact.cell"></input><br>
                    <label class="info-label">Email</label>:
                    <input type="text" class="may-edit-text email" v-model="contact.email"></input>
                </info-section>

            </div>
            <div class="card add" @click="addContact">
                <i class="fa fa-plus" aria-hidden="true"></i>
                Add an emergency contact
            </div>
        </section>
        <br>
        <section data-key="saved-locations">
            <h2>Saved Locations</h2>
            <br>
            <div class="card" v-for="location in userLocations">
                <info-section @done-editing="updateLocations">
                    <label class="info-label">Name</label>:
                    <input type="text" class="may-edit-text name" v-model="location.name"></input><br>
                    <label class="info-label">Address</label>:
                    <input type="text" class="may-edit-text address" v-model="location.location"></input><br>
                </info-section>
                <div class="card add" @click="addLocation">
                    <i class="fa fa-plus" aria-hidden="true"></i>
                    Add a new location
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import InfoSection from './info-section.vue';

export default {
    components: {
        InfoSection
    },
    props: ["userInfo", "userContacts", "userLocations"],
    methods: {
        hideInfo: function() {
            this.$emit('info-event');
        },
        addContact: function() {
            this.userContacts.push({});
        },
        addLocation: function() {
            this.userLocations.push({});
        },
        updateInfo: function() {
            this.$emit('update-info', { type: 'userInfo', info: this.userInfo });
        },
        updateContacts: function() {
            this.$emit('update-info', { type: 'contacts', info: this.userContacts });
        },
        updateLocations: function() {
            this.$emit('update-info', { type: 'locations', info: this.userLocations });
        }
    }
}
</script>

<style scoped>
h1 {
    margin-bottom: 40px;
    font-weight: normal;
}

.card {
    padding: 10px;
    background-color: #f5f5f5;
    margin-bottom: 10px;
    line-height: 1.6;
    border-radius: 4px;
    box-shadow: 1px 1px 2px 0 rgba(0, 0, 0, 0.5)
}

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
    transition: opacity 600ms ease-in-out;
    min-height: 100vh;
    text-align: left;
    z-index: 300;
    width: 100%;
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

.edit,
.done-editing {
    float: right;
    cursor: pointer;
}

.info-label {
    font-weight: bold;
}

.now-editable {
    color: #444;
}

.add {
    cursor: pointer;
}
</style>
