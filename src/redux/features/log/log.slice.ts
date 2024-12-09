import { ILog } from "@/@types/log.type";
import { ResponseError } from "@/@types/error.type";
import { IPaginatedData, TableParams } from "@/@types/pagination";
import { initialPaginatedState } from "@/@types/state.type";
import axiosInstance from "@/utils/config/axios.config";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const getAllLogs = createAsyncThunk(
  "log/getAllLogs",
  async (params: TableParams) => {
    try {
      let query = "/logs";
      if (params) {
        query += `?page=${params.pagination?.current}&limit=${params.pagination?.pageSize}`;
        if (params.search) {
          query += `&search=${params.search}`;
        }
      }
      const { data } = await axiosInstance.get<IPaginatedData<ILog>>(query);
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

const initialState = initialPaginatedState<ILog>();

const logSlice = createSlice({
  name: "log",
  initialState,
  reducers: {
    clearLogs: (state) => {
      state = initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllLogs.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllLogs.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.data = payload;
    });
    builder.addCase(getAllLogs.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { clearLogs } = logSlice.actions;

export default logSlice.reducer;
