<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import ToolBar from './components/ToolBar.vue'
import FileSideBar from './components/FileSideBar.vue'
import { Client } from '@stomp/stompjs'
import { loggingStore } from '@/stores/default-stores'

onMounted(() => {
  console.log('mounted app, connecting to fortis logging...')

  const stompClient = new Client({
    brokerURL: 'ws://localhost:8080/api/fortis-log'
  })

  stompClient.onConnect = () => {
    console.log('connected to websocket logging')
    stompClient.subscribe('/topic/logs', (message) => {
      loggingStore.value += message.body
    })
  }

  stompClient.onWebSocketError = (error) => {
    console.error('Websocket error:' + error)
  }

  stompClient.onStompError = (frame) => {
    console.error('Broker reported error: ' + frame.headers['message'])
    console.error('Additional details: ' + frame.body)
  }

  stompClient.activate()
})
</script>

<template>
  <ToolBar />

  <div class="container-fluid mt-1">
    <div class="row full-height">
      <div class="col-2 border-end border-3 h-100"><FileSideBar /></div>
      <div class="col-10 h-100"><RouterView /></div>
    </div>
  </div>
</template>
