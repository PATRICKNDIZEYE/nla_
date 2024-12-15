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
  async (params: { disputeId: string; page?: number; limit?: number }) => {
    try {
      const { disputeId, page = 1, limit = 20 } = params;
      const { data } = await axiosInstance.get<IPaginatedData<IChat>>(
        `/chats?disputeId=${disputeId}&page=${page}&limit=${limit}`
      );
      return data;
    } catch (error) {
      const err = error as ResponseError;
      throw new Error(err.response?.data.message || err.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (formData: FormData) => {
    try {
      const { data } = await axiosInstance.post("/chats", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return data;
    } catch (error) {
      const err = error as ResponseError;
      throw new Error(err.response?.data.message || err.message);
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
    },
    addMessage: (state, action) => {
      state.messages.unshift(action.payload);
      state.pagination.totalItems += 1;
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
      state.messages = payload.data;
      state.pagination = payload.pagination;
    });
    builder.addCase(getMessages.rejected, (state, { error }) => {
      state.loading = false;
      state.error = error.message || "Failed to fetch messages";
    });

    // Send Message
    builder.addCase(sendMessage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(sendMessage.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.messages.unshift(payload.data);
      state.pagination.totalItems += 1;
    });
    builder.addCase(sendMessage.rejected, (state, { error }) => {
      state.loading = false;
      state.error = error.message || "Failed to send message";
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