import { IChat } from "@/@types/chat.type";
import { ResponseError } from "@/@types/error.type";
import { IPaginatedData } from "@/@types/pagination";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/config/axios.config";

interface ChatState {
  messages: IChat[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  pagination: {
    totalItems: number;
    totalPages: number;
  };
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
  unreadCount: 0,
  pagination: {
    totalItems: 0,
    totalPages: 0
  }
};

export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (params: { disputeId: string; userId: string; page?: number; limit?: number }) => {
    try {
      const { disputeId, userId, page = 1, limit = 20 } = params;
      console.log('Fetching messages with params:', { disputeId, userId, page, limit });
      
      const { data } = await axiosInstance.get<IPaginatedData<IChat>>(
        `/chats?disputeId=${disputeId}&userId=${userId}&page=${page}&limit=${limit}`
      );
      
      console.log('Messages fetched:', data.data.length);
      // Ensure messages have valid sender objects
      const validMessages = data.data.filter(msg => msg && msg.sender && msg.sender._id);
      return {
        ...data,
        data: validMessages
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      const err = error as ResponseError;
      throw new Error(err.response?.data.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (formData: FormData) => {
    try {
      console.log('Sending message...');
      const { data } = await axiosInstance.post("/chats", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      console.log('Message sent successfully:', data);
      
      // Validate message data
      if (!data?.sender?._id) {
        throw new Error('Invalid message data received from server');
      }
      
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      const err = error as ResponseError;
      throw new Error(err.response?.data.message || 'Failed to send message');
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  "chat/markMessagesAsRead",
  async (messageIds: string[]) => {
    try {
      await axiosInstance.post("/chats/mark-read", { messageIds });
      return messageIds;
    } catch (error) {
      const err = error as ResponseError;
      throw new Error(err.response?.data.message || err.message);
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  "chat/getUnreadCount",
  async (userId: string) => {
    try {
      const { data } = await axiosInstance.get(`/chats/unread-count?userId=${userId}`);
      return data.count;
    } catch (error) {
      const err = error as ResponseError;
      throw new Error(err.response?.data.message || err.message);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.pagination = initialState.pagination;
      state.error = null;
    },
    addMessage: (state, action) => {
      // Validate message before adding
      if (action.payload?.sender?._id) {
        state.messages.unshift(action.payload);
        state.pagination.totalItems += 1;
        state.error = null;
      } else {
        console.warn('Attempted to add invalid message:', action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    // Get Messages
    builder.addCase(getMessages.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getMessages.fulfilled, (state, { payload }) => {
      state.loading = false;
      // Filter out invalid messages
      state.messages = payload.data.filter(msg => msg?.sender?._id);
      state.pagination = payload.pagination;
      state.error = null;
    });
    builder.addCase(getMessages.rejected, (state, { error }) => {
      state.loading = false;
      state.error = error.message || "Failed to fetch messages";
      console.error('Failed to fetch messages:', error);
    });

    // Send Message
    builder.addCase(sendMessage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(sendMessage.fulfilled, (state, { payload }) => {
      state.loading = false;
      // Only add valid messages
      if (payload?.sender?._id) {
        state.messages.unshift(payload);
        state.pagination.totalItems += 1;
      }
      state.error = null;
    });
    builder.addCase(sendMessage.rejected, (state, { error }) => {
      state.loading = false;
      state.error = error.message || "Failed to send message";
      console.error('Failed to send message:', error);
    });

    // Mark Messages as Read
    builder.addCase(markMessagesAsRead.fulfilled, (state, { payload }) => {
      state.messages = state.messages.map(message => 
        payload.includes(message._id) ? { ...message, read: true } : message
      );
      state.unreadCount = Math.max(0, state.unreadCount - payload.length);
    });

    // Get Unread Count
    builder.addCase(getUnreadCount.fulfilled, (state, { payload }) => {
      state.unreadCount = payload;
    });
  }
});

export const { clearMessages, addMessage } = chatSlice.actions;
export default chatSlice.reducer; 