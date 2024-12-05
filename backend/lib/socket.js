import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}
//used to store online users
const userSocketMap = {}; //{userId: socketId}
const typingUsers = {}; //{userId: {receiverId, isTyping}}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  socket.on("typing", ({ receiverId, senderId, isTyping }) => {
    if (isTyping) {
      typingUsers[senderId] = {
        receiverId,
        isTyping,
      };
    } else {
      delete typingUsers[senderId];
    }
    const receiverSocketId = getReceiverSocketId(receiverId);
    io.to(receiverSocketId).emit("getTypingUsers", Object.keys(typingUsers));

    //send live typing message to receiver
    
    User.findById(receiverId).then((user) => {
      if (user.showTypingMessage) {

      }
    });
  });
  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, server, app };
