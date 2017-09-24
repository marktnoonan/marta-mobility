<template>
    <div class="my-info-output">
     <button class="closer" alt="cancel" @click="hideInfo()">X</button>
        <h1>My Information</h1>
        <section data-key="info">
            <h2>About Me</h2>
            <br>
            <div class="card">
                <span class="edit">
                    <i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit
                </span>
                <span class="info-label">Name</span>:
                <span class="may-edit-text name" data-text-type="name">{{userInfo.name}}</span><br>
                <span class="info-label">Cell Number</span>:
                <span class="may-edit-text cell" data-text-type="cell">{{userInfo.cell}}</span><br>
                <span class="info-label">Email</span>:
                <span class="may-edit-text email" data-text-type="email">{{userInfo.email}}</span><br>
                <span class="info-label">Tracking</span>:
                <span class="may-edit tracking">{{userInfo.track}}</span>
                <span class="done-editing hidden">
                    <i class="fa fa-check" aria-hidden="true"></i> Done</span>

            </div>
        </section>
        <br>
        <section data-key="emergency-contacts">
            <h2>Emergency Contacts</h2>
            <br>
            <div v-for="contact in userInfo.emergencyContacts" class="card">
                <span class="edit">
                    <i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit
                </span>
                <span class="info-label">Name</span>:
                <span class="may-edit-text name" data-text-type="name">{{contact.name}}</span><br>
                <span class="info-label" data-text-type="cell">Cell Number</span>:
                <span class="may-edit-text cell">{{contact.cell}}</span><br>
                <span class="info-label">Email</span>:
                <span class="may-edit-text email" data-text-type="email">{{contact.email}}</span>
                <span class="done-editing hidden">
                    <i class="fa fa-check" aria-hidden="true"></i> Done</span>

            </div>
            <div class="card">
                <i class="fa fa-plus" aria-hidden="true"></i> Add an emergency contact</div>
        </section>
        <br>
        <section data-key="saved-locations">
            <h2>Saved Locations</h2>
            <br>
            <div class="card" v-for="location in userInfo.locations">
                <span class="edit">
                    <i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit
                </span>
                <span class="info-label">Name</span>:
                <span class="may-edit-text name" data-text-type="short-name">{{location.name}}</span><br>
                <span class="info-label">Address</span>:
                <span class="may-edit-text address" data-text-type="">{{location.location}}</span><br>
                <span class="done-editing hidden">
                    <i class="fa fa-check" aria-hidden="true"></i> Done</span>
            </div>
            <div class="card">
                <i class="fa fa-plus" aria-hidden="true"></i> Add a new location</div>
        </section>
    </div>
</template>

<script>
export default {
  props: ["userInfo"],
  methods: {
      hideInfo: function() {
          this.$emit('info-event');
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
.edit, .done-editing {
  float: right;
  cursor: pointer;
}

.info-label {
  font-weight: bold;
}

.now-editable {
  color: #444;
}

</style>
