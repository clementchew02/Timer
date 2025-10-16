<script setup>
import { ref, computed, onMounted } from 'vue';
// Ensure these paths match your file structure:
// '@/utils/formatTime' -> frontend/utils/formatTime.js
// '@/composables/useSocket' -> frontend/composables/useSocket.js
import { formatTime } from '@/utils/formatTime'; 
import { useSocket } from '@/composables/useSocket';

const props = defineProps({
  roomName: {
    type: String,
    required: true
  }
});

// Initial state (Will be immediately overwritten by server state on connect)
// Note: The actual timer duration (5 minutes or 5 seconds) is controlled by the backend (backend/app.js).
const timeLeft = ref(5 * 60 * 1000); 
const isRunning = ref(false);
const isAlarming = ref(false); // State for visual alarm effect

const { socket } = useSocket();

const formattedTime = computed(() => formatTime(timeLeft.value));


// 1. MP3 Alarm Function: Plays the sound located at /public/alarm.mp3
const playAlarmSound = () => {
    try {
        const audio = new Audio('/alarm.mp3'); 
        audio.volume = 0.5;
        
        // Audio playback often requires user interaction first. 
        // We use catch to handle potential browser autoplay restrictions.
        audio.play().catch(error => {
            console.error("Failed to play alarm audio:", error);
        });
        
    } catch (error) {
        console.error("Error creating Audio object:", error);
    }
};


// 2. Button Handlers: Sends command to the backend via Socket.IO
const sendCommand = (command) => {
  // Clear visual alarm state if the user interacts (e.g., stops or restarts)
  isAlarming.value = false; 
  console.log(`[Frontend] Emitting command: ${command} for ${props.roomName}`);

  socket.emit('timer-command', { 
    room: props.roomName, 
    command 
  });
};

const handleAlarm = () => {
    isAlarming.value = true;
    playAlarmSound(); 
    
    // Simple message box in console (No alert() is allowed in the browser)
    console.warn(`ALARM: Time's up in ${props.roomName}!`);
};


// 3. Real-time Listeners
onMounted(() => {
    // Listen for general state updates (persistence and countdown)
    socket.on('timer-update', (data) => {
        if (data.room === props.roomName) {
            timeLeft.value = data.timeLeft;
            isRunning.value = data.isRunning;
            
            // If the time is reset by the backend, clear the alarm visual
            if (data.timeLeft > 0) {
                isAlarming.value = false;
            }
        }
    });
    
    // Listen for the server-triggered alarm event
    socket.on('timer-alarm', (data) => {
        if (data.room === props.roomName) {
            handleAlarm();
        }
    });
});
</script>

<template>
  <div class="room-timer">
    <h2>{{ roomName }}</h2>
    <div 
        class="timer-display" 
        :class="{ 'running': isRunning, 'alarm-blink': isAlarming }"
    >
      {{ formattedTime }}
    </div>
    <div class="controls">
      <button 
        @click="sendCommand('start')" 
        :disabled="isRunning || formattedTime === '00:00'"
        :class="{ 'bg-green-500 hover:bg-green-600 text-white': !isRunning && formattedTime !== '00:00' }"
      >
        <span v-if="formattedTime === '00:00'">Finished</span>
        <span v-else>{{ isRunning ? 'Running...' : 'Start' }}</span>
      </button>
      <button 
        @click="sendCommand('stop')" 
        :disabled="!isRunning"
        :class="{ 'bg-yellow-500 hover:bg-yellow-600': isRunning }"
      >
        Stop
      </button>
      <button 
        @click="sendCommand('restart')"
        class="bg-red-500 hover:bg-red-600 text-white"
      >
        Restart (5:00)
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind-like styling for a clean, modern look */
.room-timer {
  border: 1px solid #e0e0e0;
  padding: 20px;
  margin: 15px;
  text-align: center;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  width: 300px;
  transition: transform 0.3s;
}
.room-timer:hover {
    transform: translateY(-3px);
}
h2 { 
    color: #333; 
    margin-top: 0; 
    font-size: 1.5rem; 
    font-weight: 700;
}
.timer-display {
  font-size: 5em;
  margin: 20px 0;
  font-family: 'Arial Black', monospace;
  color: #555;
  transition: all 0.2s;
  letter-spacing: -2px;
}
.running {
    color: #1e40af; /* Darker blue when running */
    font-weight: 700;
}
.controls button {
  padding: 10px 15px;
  margin: 5px;
  cursor: pointer;
  border: none;
  border-radius: 6px;
  transition: all 0.2s;
  font-weight: 600;
  color: #333;
}
/* Tailwind Color Definitions (simplified) */
.bg-green-500 { background-color: #10b981; }
.hover\:bg-green-600:hover { background-color: #059669; }
.bg-yellow-500 { background-color: #f59e0b; }
.hover\:bg-yellow-600:hover { background-color: #d97706; }
.bg-red-500 { background-color: #ef4444; }
.hover\:bg-red-600:hover { background-color: #dc2626; }
.text-white { color: white; }

.controls button:disabled {
    cursor: not-allowed;
    opacity: 0.4;
    background-color: #f0f0f0;
    color: #777;
}

/* Alarm Blink Effect: Flashes red when time is 00:00 AND the alarm event has fired */
.alarm-blink {
    color: #ff0000 !important;
    font-weight: bold;
    animation: blinker 0.4s linear infinite;
    transform: scale(1.05);
}
@keyframes blinker {
  50% { opacity: 0.1; }
}
</style>