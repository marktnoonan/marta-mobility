<template>
   <div class="header show">
    <div class="logo">
      <i class="fa fa-wheelchair-alt fa-lg" aria-hidden="true"></i> Paratransit Pal
      </div>
    <app-menu v-on:open-info="showEvent" @open-reports="showReports"></app-menu>
    
  </div>
</template>


<script>
import AppMenu from './app-menu.vue';
export default {
  components: {
      AppMenu
  },
  methods: {
      showEvent: function() {
          this.$emit('info-event');
      },
      showReports: function() {
          this.$emit('reports-event');
      }
  }
}
</script>

<style scoped>
.header {
  top: 0;
  position: fixed;
  width: 100%;
  z-index: 900;
  text-align: center;
  background: #dedede;
  background-image: linear-gradient(to top, #52A7B4 0, #f8f8f8 100%);
  padding: 10px;
  margin-top: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .15), 0 1px 5px rgba(0, 0, 0, .075);
  pointer-events: none;
  box-sizing: border-box;
}
.logo {
  display: inline-block;
  font-size: 1.6em;
}

.logo-img {
  position: absolute;
  top: 40px;
  margin: auto;
}
.show {
  opacity: 1;
  pointer-events: all;
  transition: opacity 600ms
}

</style>
