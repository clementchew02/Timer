
Real-time Full-Stack Timer Application
This is a real-time, persistent, multi-room countdown timer application built with a Node.js/Socket.IO backend and a Nuxt 3 (Vue 3) frontend. The timer state is managed entirely by the server, ensuring that all connected clients (and new clients) see the exact same time, regardless of when they connect or refresh.

Key Features
Real-time Synchronization: Timer state (running/stopped/time left) is synchronized across all connected users via Socket.IO.
Server Persistence: The timer continues to run even if all clients disconnect.
Multi-Room Support: Includes three independent timers (Room A, Room B, Room C).
Looping Alarm: When the timer reaches zero, the custom alarm sound (/alarm.mp3) will loop continuously until the user explicitly clicks the SILENCE ALARM button or Restart.
One-Command Start: A single script starts both the frontend and backend simultaneously.

Architecture
Component
Technology
Role
Port
Backend
Node.js, Express, Socket.IO Server
Authoritative state management, interval control, real-time data broadcast.
3001
Frontend
Nuxt 3 (Vue 3), Socket.IO Client
UI rendering, controls, real-time consumption, looping alarm audio.
3000

Setup and Installation
Follow these steps to set up and run the application. You must have Node.js and npm installed.
1. Install Global Dependencies
Navigate to the root project directory and install the development tool concurrently, which allows running both servers with one command.
# In the root directory (where backend/ and frontend/ reside)
npm install --save-dev concurrently


2. Install Sub-Project Dependencies
Install dependencies for both the server and the client.
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install socket.io-client
npm install


3. Add Custom Alarm Sound
For the alarm feature to work, place your custom MP3 file in the correct location:
Rename your alarm sound file to alarm.mp3.
Place it inside the public assets folder: frontend/public/alarm.mp3.
▶️ Running the Application
Once all dependencies are installed, you only need one command from the root project directory:
npm start


This command automatically executes:
node backend/app.js (Backend on http://localhost:3001)
nuxt dev (Frontend on http://localhost)
Accessing the App
Open your web browser and navigate to:
http://localhost
🗂️ Project Structure
The project follows a clean separation of concerns:
/
├── package.json          <-- Root configuration for 'npm start' (concurrently)
├── backend/
│   ├── app.js            <-- Core Node.js server and Socket.IO logic
│   └── package.json      <-- Backend dependencies
└── frontend/
    ├── app.vue           <-- Main application layout
    ├── pages/
    │   └── index.vue     <-- Main page displaying all timers
    ├── components/
    │   └── RoomTimer.vue <-- Timer display, controls, and alarm logic
    ├── composables/
    │   └── useSocket.js  <-- Socket.IO connection setup
    └── package.json      <-- Frontend dependencies (Nuxt, Vue)

