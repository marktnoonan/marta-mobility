<template>
    <div v-if="!menu" class="menu-open">
        <i class="fa fa-bars fa-lg" title="Toggle Menu" v-on:click="toggleMenu"></i>
    </div>
    <div v-else>
        <div class="menu-close">
            <i class="fa fa-chevron-up fa-lg" title="Toggle Menu" v-on:click="toggleMenu"></i>
        </div>
        <div class="menu-panel">
            <ul class="menu-list">
                <li><a @click="openInfo">My Information</a></li>
                <li><a @click="openReports">My Reports</a></li>
                <li><a @click="logOut">Log Out</a></li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            menu: false
        };
    },
    methods: {
        toggleMenu: function() {
            this.menu = !this.menu;
        },
        openInfo: function() {
            this.$emit('open-info');
            this.menu = false;
        },
        openReports: function() {
            this.$emit('open-reports');
            this.menu = false;
        },
        logOut: function() {
            this.$emit('logout');
        }
    }
}
</script>

<style>
.menu-open {
    margin-top: 3px;
    float: right;
    cursor: pointer;
}

.menu-close {
    position: absolute;
    top: 10px;
    right: 0;
    padding-right: 10px;
    cursor: pointer;
}

.menu-panel {
    background-color: #52A7B4;
    position: absolute;
    top: 45px;
    right: 0;
    padding: 10px;
    text-align: left;
    font-weight: bold;
    line-height: 1.6;
    width: 100%;
    z-index: 100;
}

.menu-list {
    list-style: none;
    margin-left: 0;
    padding-left: 0;
}

.menu-list>li {
    border: 1px solid #444;
    background-color: #fff;
    margin-bottom: 8px;
    padding-top: 5px;
    padding-bottom: 3px;
    padding-left: 8px;
    cursor: pointer;
    border-radius: 4px;
}

.menu-list>li:hover {
  background-color: #dff0d8;
}

</style>
