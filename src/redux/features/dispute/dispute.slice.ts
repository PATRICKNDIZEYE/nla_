import { IDispute } from "@/@types/dispute.type";
import { ResponseError } from "@/@types/error.type";
import {
  IDataResponse,
  IPaginatedData,
  TableParams,
} from "@/@types/pagination";
import { initialPaginatedState } from "@/@types/state.type";
import axiosInstance from "@/utils/config/axios.config";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const getAllDisputes = createAsyncThunk(
  "dispute/getAllDisputes",
  async (params: TableParams & { status?: string; userId?: string }) => {
    try {
      console.log('Fetching disputes with params:', params);
      let query = "/disputes";
      if (params) {
        query += `?page=${params.pagination?.current}&limit=${params.pagination?.pageSize}`;
        if (params.search) {
          query += `&search=${params.search}`;
        }
        if (params.role) {
          query += `&role=${params.role}`;
        }
        if (params.status) {
          query += `&status=${params.status}`;
        }
        if (params.userId) {
          query += `&userId=${params.userId}`;
        }
        if (params.level) {
          query += `&level=${params.level}`;
        }
      }
      console.log('API query:', query);
      const { data } = await axiosInstance.get<IPaginatedData<IDispute>>(query);
      console.log('API response:', {
        count: data.data.length,
        totalItems: data.pagination.totalItems
      });
      return data;
    } catch (error) {
      console.error('Error fetching disputes:', error);
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const getDisputeById = createAsyncThunk(
  "dispute/getDisputeById",
  async (disputeId: string) => {
    try {
      const { data } = await axiosInstance.get<IDataResponse<IDispute>>(
        `/disputes/${disputeId}`
      );
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const createDispute = createAsyncThunk(
  "dispute/createDispute",
  async (payload: FormData) => {
    try {
      const { data } = await axiosInstance.post<IDataResponse<IDispute>>(
        "/disputes",
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
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



export const updateStatus = createAsyncThunk(
  "dispute/updateStatus",
  async (
    payload: {
      disputeId: string;
      status: IDispute["status"];
      userId: string;
      feedback?: string;
    } & { stampedLetter?: any }
  ) => {
    try {
      console.log(payload.stampedLetter);
      const formData = new FormData();
      if (payload.stampedLetter) {
        formData.append("stampedLetter", payload.stampedLetter);
      }
      if (payload.feedback) {
        formData.append("feedback", payload.feedback);
      }
      const { data } = await axiosInstance.put<IDataResponse<IDispute>>(
        `/disputes/${payload.disputeId}?userId=${payload.userId}&status=${payload.status}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

const initialState = initialPaginatedState<IDispute>();

const disputeSlice = createSlice({
  name: "dispute",
  initialState,
  reducers: {
    clearDispute: () => initialState,
    setSingleDispute: (
      state,
      {
        payload,
      }: {
        payload: IDispute;
      }
    ) => {
      state.data.singleData = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllDisputes.pending, (state) => {
      console.log('Fetching disputes - pending');
      state.loading = true;
      state.error = null;
      // Don't clear data to maintain previous state while loading
    });
    builder.addCase(getAllDisputes.fulfilled, (state, { payload }) => {
      console.log('Fetching disputes - fulfilled:', {
        count: payload.data.length,
        totalItems: payload.pagination.totalItems
      });
      state.loading = false;
      state.error = null;
      state.data = {
        data: payload.data || [],
        pagination: payload.pagination || { totalItems: 0, totalPages: 0 },
        singleData: state.data.singleData
      };
    });
    builder.addCase(getAllDisputes.rejected, (state, { error }) => {
      console.log('Fetching disputes - rejected:', error);
      state.loading = false;
      state.error = error.message;
      // Don't clear data on error to maintain previous state
    });
    builder.addCase(getDisputeById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getDisputeById.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.error = null;
      state.data.singleData = payload.data;
      state.data.data = state.data.data.map((dispute) => {
        if (dispute._id === payload.data._id) {
          return payload.data;
        }
        return dispute;
      });
    });
    builder.addCase(getDisputeById.rejected, (state, { error }) => {
      state.loading = false;
      state.error = error.message;
    });
    builder.addCase(createDispute.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createDispute.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.error = null;
      state.data.data.unshift(payload.data);
    });
    builder.addCase(createDispute.rejected, (state, { error }) => {
      state.loading = false;
      state.error = error.message;
    });
    builder.addCase(updateStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateStatus.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.error = null;
      state.data.singleData = payload.data;
      state.data.data = state.data.data.map((dispute) => {
        if (dispute._id === payload.data._id) {
          return {
            ...dispute,
            status: payload.data.status,
          };
        }
        return dispute;
      });
    });
    builder.addCase(updateStatus.rejected, (state, { error }) => {
      state.loading = false;
      state.error = error.message;
    });
  },
});

export const { clearDispute, setSingleDispute } = disputeSlice.actions;

export default disputeSlice.reducer;
