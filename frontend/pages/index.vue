<script setup>
import RoomTimer from '@/components/RoomTimer.vue';
</script>

<template>
  <div class="app-container">
    <h1>5-Minute Countdown Timers</h1>
    <div class="rooms-container">
      <RoomTimer room-name="Room A" />
      <RoomTimer room-name="Room B" />
      <RoomTimer room-name="Room C" />
    </div>
  </div>
</template>

<style>
/* Basic global styles */
body {
    font-family: sans-serif;
    background-color: #f4f7f6;
    margin: 0;
    padding: 0;
}
.app-container {
    max-width: 1200px;
    margin: 40px auto;
    padding: 20px;
    text-align: center;
}
.rooms-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 30px;
}
</style>