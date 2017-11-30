<template>
    <div class="card">
        <span class="edit" @click="editing=true;" v-if="!editing">
            <i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit
        </span>
        <span v-else class="done-editing hidden" @click="doneEditing">
            <i class="fa fa-check" aria-hidden="true"></i> Done</span>
        <fieldset :disabled="!editing">
        <slot></slot>
        </fieldset>

    </div>
</template>

<script>
export default {
    data: function() {
        return {
            editing: false,
        };
    },
    methods: {
        doneEditing: function() {
            this.editing = false;
            this.$emit('done-editing');
        }
    }
}
</script>

<style>
fieldset {
    border: none;
}
.card {
    padding: 10px;
    background-color: #f5f5f5;
    margin-bottom: 10px;
    line-height: 1.6;
    border-radius: 4px;
    box-shadow: 1px 1px 2px 0 rgba(0, 0, 0, 0.5)
}
.edit,
.done-editing {
    float: right;
    cursor: pointer;
}
</style>
