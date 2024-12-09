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
  "invitation/getAllInvitations",
  async (params: TableParams) => {
    try {
      let query = "/invitations";
      if (params) {
        query += `?page=${params.pagination?.current}&limit=${params.pagination?.pageSize}`;
        if (params.search) {
          query += `&search=${params.search}`;
        }
        if (params.userId) {
          query += `&userId=${params.userId}`;
        }
      }
      const { data } = await axiosInstance.get<IPaginatedData<IInvitation>>(
        query
      );
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
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
  },
});

export const { resetState } = invitationSlice.actions;

export default invitationSlice.reducer;
