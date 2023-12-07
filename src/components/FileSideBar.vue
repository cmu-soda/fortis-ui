<script setup lang="ts">
import FileList from './FileList.vue'
</script>

<template>
  <div class="vstack gap-1">
    <div class="p-1">
      <FileList name="System" :files="['model.lts', 'model.lts']" />
    </div>
    <div class="p-1">
      <FileList name="Environment" :files="['model.lts', 'model.lts']" />
    </div>
    <div class="p-1">
      <FileList name="Property" :files="['model.lts', 'model.lts']" />
    </div>
  </div>
</template>