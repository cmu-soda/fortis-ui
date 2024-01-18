<script setup lang="ts">
import { loggingStore } from '@/stores/default-stores'
</script>

<template>
  <div
    class="offcanvas offcanvas-bottom"
    data-bs-scroll="true"
    data-bs-backdrop="false"
    tabindex="-1"
    id="loggingCanvas"
    aria-labelledby="loggingCanvasLabel"
  >
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="loggingCanvasLabel">Log</h5>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      ></button>
    </div>
    <div class="offcanvas-body bg-dark-subtle">
      <pre class="">{{ loggingStore }}</pre>
    </div>
  </div>
</template>

<style scoped>
#loggingCanvas {
  height: 40%;
}
</style>
