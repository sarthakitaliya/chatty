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
  const socketId = userSocketMap[userId];
  return socketId;
}
//used to store online users
const userSocketMap = {}; //{userId: socketId}
const typingUsers = {}; //{userId: {receiverId, isTyping, typingValue}}

io.use(async (socket, next) => {
  try {
    const userId = socket.handshake.query.userId;
    const user = await User.findById(userId);
    socket.user = user;
    next();
  } catch (error) {
    next(error);
  }
});
io.on("connection", async (socket) => {
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
  });
  socket.on("sendLiveMessages", (value, senderId, receiverId) => {
    const receiverSocketId = getReceiverSocketId(receiverId);    
    socket.to(receiverSocketId).emit("liveMessage", {value, senderId});    
  })
  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    delete typingUsers[userId];
  });
});

export { io, server, app };
