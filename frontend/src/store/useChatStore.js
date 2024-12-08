import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  liveMessages: [],
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      console.log("error in getUsers " + error.response.data.message);
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      console.log(error.response);

      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;
      set({ messages: [...get().messages, newMessage] });
    });
  },
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setTypingUser: (value) => {
    const socket = useAuthStore.getState().socket;
    const receiverId = get().selectedUser._id;
    const senderId = useAuthStore.getState().authUser._id;
    socket.emit("typing", { receiverId, senderId, isTyping: value });
  },
  unsubscribeTypingUser: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("typing");
  },
  sendLiveMessagges: (value) => {
    const socket = useAuthStore.getState().socket;
    const receiverId = get().selectedUser._id;
    const senderId = useAuthStore.getState().authUser._id;    
    socket.emit("sendLiveMessages", value, senderId, receiverId);
    socket.on("liveMessage", ({value, senderId}) => {      
      set({ liveMessages: {senderId: senderId, message: value} });
    })
  },
  unsubscribeLiveMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("liveMessage");
  },
}));
