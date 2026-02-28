📌 Smart Tap – Real-Time Video Calling Web Application

📖 Overview

Smart Tap is a real-time video conferencing web application developed using WebRTC and Socket.IO.
The system enables peer-to-peer video communication using unique user IDs for direct call initiation.

This project demonstrates signaling server implementation, peer connection handling, ICE candidate exchange, and real-time media streaming.


🎯 Features

Unique User ID generation using Socket.IO

Direct ID-based calling

Incoming call notification

Accept / Reject call mechanism

Real-time audio and video communication

ICE candidate exchange for NAT traversal

Proper call termination synchronization

Responsive and interactive UI



🏗 Tech Stack

React.js (Frontend)

Node.js + Express (Backend)

Socket.IO (Signaling)

WebRTC (Peer-to-Peer Media Streaming)

STUN Server (Google STUN)



🔄 System Flow

User connects to signaling server.

Unique socket ID is generated.

Caller enters receiver's ID.

Receiver gets incoming call notification.

On accept:

Offer is created

Answer is returned

ICE candidates exchanged

Peer-to-peer connection established.

Media stream flows directly between users.



📊 Architecture

Signaling handled via Socket.IO

Media handled via WebRTC RTCPeerConnection

STUN used for NAT traversal

Direct socket-to-socket signaling



🚀 How to Run

Backend
cd Server
npm install
node index.js
Frontend
cd client
npm install
npm start


📌 Future Enhancements

Multi-user video conferencing

Screen sharing

Call recording

Authentication system

TURN server integration