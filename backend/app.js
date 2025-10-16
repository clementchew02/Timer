// backend/app.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configure CORS to allow your Nuxt frontend to connect
const io = new Server(server, {
    cors: {
        // Ensure this matches where your Nuxt app is running (usually 3000)
        origin: "http://localhost", 
        methods: ["GET", "POST"]
    }
});

const DEFAULT_TIME_MS = 5 * 60 * 1000; // 5 minutes
const ROOMS = ['Room A', 'Room B', 'Room C'];

// State object to hold all authoritative timer data
let timerStates = {};
ROOMS.forEach(room => {
    timerStates[room] = {
        timeLeft: DEFAULT_TIME_MS,
        isRunning: false,
        intervalId: null,
        lastUpdate: Date.now()
    };
});

// Timer update function: calculates elapsed time and broadcasts state
function updateTimer(room) {
    const state = timerStates[room];
    const now = Date.now();
    
    if (state.isRunning) {
        const elapsed = now - state.lastUpdate;
        state.timeLeft -= elapsed;
        state.lastUpdate = now;

        if (state.timeLeft <= 0) {
            state.timeLeft = 0;
            state.isRunning = false;
            clearInterval(state.intervalId);
            state.intervalId = null;
            
            // 4. Sound Alarm - Broadcast a specific event for the client to handle
            io.emit('timer-alarm', { room });
        }
    }
    
    // Broadcast the updated state (timeLeft and isRunning)
    io.emit('timer-update', { room, timeLeft: state.timeLeft, isRunning: state.isRunning });
}

// Command handler (Start, Stop, Restart)
function handleCommand(room, command) {
    const state = timerStates[room];
    
    if (command === 'start' && !state.isRunning && state.timeLeft > 0) {
        state.isRunning = true;
        state.lastUpdate = Date.now();
        if (state.intervalId) clearInterval(state.intervalId); 
        state.intervalId = setInterval(() => updateTimer(room), 100); 
        updateTimer(room); // Immediate update
    } else if (command === 'stop' && state.isRunning) {
        state.isRunning = false;
        clearInterval(state.intervalId);
        state.intervalId = null;
        updateTimer(room); 
    } else if (command === 'restart') {
        if (state.intervalId) clearInterval(state.intervalId);
        state.intervalId = null;
        state.isRunning = false;
        state.timeLeft = DEFAULT_TIME_MS;
        updateTimer(room);
    }
}

// Socket.IO Connection Handler
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // Send initial states to the new client (Handles Persistence)
    ROOMS.forEach(room => {
        // Recalculate time for running timers before sending to ensure accuracy
        if (timerStates[room].isRunning) {
            updateTimer(room);
        }
        socket.emit('timer-update', { 
            room, 
            timeLeft: timerStates[room].timeLeft, 
            isRunning: timerStates[room].isRunning 
        });
    });

    // Listen for client commands (Start/Stop/Restart)
    socket.on('timer-command', (data) => {
        const { room, command } = data;
        if (ROOMS.includes(room)) {
            handleCommand(room, command);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 3001; // The backend should run on a different port than Nuxt (3000)
server.listen(PORT, () => {
    console.log(`Timer Backend listening on port ${PORT}`);
});