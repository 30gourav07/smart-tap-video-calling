const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // CALL USER
  socket.on("call-user", ({ targetId, name }) => {
    const targetSocket = io.sockets.sockets.get(targetId);

    if (targetSocket) {
      io.to(targetId).emit("incoming-call", {
        from: socket.id,
        name
      });
    } else {
      socket.emit("user-not-available");
    }
  });

  // ACCEPT CALL
  socket.on("accept-call", ({ targetId }) => {
    io.to(targetId).emit("call-accepted", {
      from: socket.id
    });
  });

  // OFFER
  socket.on("offer", ({ targetId, offer }) => {
    io.to(targetId).emit("offer", {
      from: socket.id,
      offer
    });
  });

  // ANSWER
  socket.on("answer", ({ targetId, answer }) => {
    io.to(targetId).emit("answer", {
      answer
    });
  });

  // ICE
  socket.on("ice-candidate", ({ targetId, candidate }) => {
    io.to(targetId).emit("ice-candidate", {
      candidate
    });
  });

  // END CALL
  socket.on("end-call", ({ targetId }) => {
    io.to(targetId).emit("call-ended");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});