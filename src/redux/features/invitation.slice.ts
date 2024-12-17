import { ResponseError } from "@/@types/error.type";
import {
  IDataResponse,
  IPaginatedData,
  TableParams,
} from "@/@types/pagination";
import { initialPaginatedState } from "@/@types/state.type";
import { IInvitation, Invitations } from "@/models/Invitation";
import axiosInstance from "@/utils/config/axios.config";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const getAllInvitations = createAsyncThunk(
  "invitation/getAll",
  async (params: QueryParams) => {
    try {
      console.log('getAllInvitations params:', params); // Debug log
      const { data } = await axiosInstance.get("/invitations", {
        params: {
          ...params,
          role: params.role // Ensure role is included
        }
      });
      return data;
    } catch (error) {
      const err = error as ResponseError;
      throw new Error(err.response?.data.message || err.message);
    }
  }
);

export const createInvitation = createAsyncThunk(
  "invitation/createInvitation",
  async (
    params: Pick<
      IInvitation,
      "dateTime" | "dispute" | "invitedBy" | "invitees" | "location"
    >
  ) => {
    try {
      const { data } = await axiosInstance.post<IDataResponse<IInvitation>>(
        "/invitations",
        params
      );
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const cancelInvitation = createAsyncThunk(
  "invitation/cancelInvitation",
  async (id: string) => {
    try {
      const { data } = await axiosInstance.put<IDataResponse<IInvitation>>(
        `/invitations/${id}`
      );
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const generateInvitationLetter = createAsyncThunk(
  "invitation/generateLetter",
  async (params: { 
    invitationId: string; 
    letterType: 'first' | 'reminder' | 'final';
    meetingDate: string;
    venue: string;
    additionalNotes?: string;
  }) => {
    try {
      const { data } = await axiosInstance.post<IDataResponse<{ letterUrl: string }>>(
        `/invitations/${params.invitationId}/letter`,
        params
      );
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const assignDefendant = createAsyncThunk(
  "invitation/assignDefendant",
  async (params: { invitationId: string }) => {
    try {
      const { data } = await axiosInstance.post<IDataResponse<IInvitation>>(
        `/invitations/${params.invitationId}/assign-defendant`
      );
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const shareDocuments = createAsyncThunk(
  "invitation/shareDocuments",
  async (params: { 
    invitationId: string;
    documents: File[];
    recipientType: string[];
    message?: string;
  }) => {
    try {
      const formData = new FormData();
      params.documents.forEach((file) => {
        formData.append('documents', file);
      });
      params.recipientType.forEach((type) => {
        formData.append('recipientType', type);
      });
      if (params.message) {
        formData.append('message', params.message);
      }

      const { data } = await axiosInstance.post<IDataResponse<{ success: boolean }>>(
        `/invitations/${params.invitationId}/share-documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

const initialState = initialPaginatedState<IInvitation>();

const invitationSlice = createSlice({
  name: "invitation",
  initialState,
  reducers: {
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getAllInvitations.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllInvitations.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(getAllInvitations.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(createInvitation.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createInvitation.fulfilled, (state, action) => {
      state.loading = false;
      state.data.data.unshift(action.payload.data);
      state.data.pagination.totalItems += 1;
    });
    builder.addCase(createInvitation.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(cancelInvitation.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(cancelInvitation.fulfilled, (state, action) => {
      state.loading = false;
      state.data.data.forEach((item) => {
        if (item._id === action.payload.data._id) {
          item.isCanceled = true;
        }
      });
    });
    builder.addCase(cancelInvitation.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(generateInvitationLetter.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(generateInvitationLetter.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(generateInvitationLetter.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(assignDefendant.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(assignDefendant.fulfilled, (state, action) => {
      state.loading = false;
      state.data.data = state.data.data.map((item) =>
        item._id === action.payload.data._id ? action.payload.data : item
      );
    });
    builder.addCase(assignDefendant.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(shareDocuments.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(shareDocuments.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(shareDocuments.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { resetState } = invitationSlice.actions;

export default invitationSlice.reducer;
