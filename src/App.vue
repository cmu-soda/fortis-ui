<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToolBar from './components/ToolBar.vue'
import FileSideBar from './components/FileSideBar.vue'
</script>

<template>
  <ToolBar />

  <div class="container-fluid full-height">
    <div class="row full-height">
      <div class="col-2 border-end border-3"><FileSideBar /></div>
      <div class="col-10"><RouterView /></div>
    </div>
  </div>
</template>
