const { Server } = require("socket.io");

let io;
const connectedUsers = new Map(); // userId -> socket.id

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("register-helper", (userId) => {
      connectedUsers.set(userId, socket.id);
      console.log(`Helper registered: ${userId}`);
    });

    socket.on("disconnect", () => {
      for (const [userId, id] of connectedUsers.entries()) {
        if (id === socket.id) connectedUsers.delete(userId);
      }
      console.log("Socket disconnected:", socket.id);
    });
  });
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

function getConnectedHelpers() {
  return connectedUsers;
}

module.exports = { initSocket, getIO, getConnectedHelpers };
