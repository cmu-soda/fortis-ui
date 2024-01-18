<script setup lang="ts">
defineProps({
  show: Boolean,
  message: String,
  success: Boolean
})
</script>

<template>
  <div
    v-if="show"
    class="alert alert-success fixed-top d-flex m-2"
    :class="success ? 'alert-success' : 'alert-danger'"
    role="alert"
  >
    <span class="d-block me-auto">{{ message }}</span>
    <button type="button" class="btn-close" aria-label="Close" @click="$emit('close')"></button>
  </div>
</template>
