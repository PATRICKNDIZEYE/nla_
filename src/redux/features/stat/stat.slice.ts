import { IAnalytics, IStat } from "@/@types/stat.type";
import { ResponseError } from "@/@types/error.type";
import {
  IDataResponse,
  IPaginatedData,
  TableParams,
} from "@/@types/pagination";
import { initialPaginatedState, initialState } from "@/@types/state.type";
import axiosInstance from "@/utils/config/axios.config";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const getAllStats = createAsyncThunk(
  "stat/getAllStats",
  async () => {
    try {
      let query = "/claims/analytics";
      const { data } = await axiosInstance.get<IAnalytics>(
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

const statSlice = createSlice({
  name: "stat",
  initialState: initialState<IAnalytics>(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllStats.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllStats.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.data = payload;
    });
    builder.addCase(getAllStats.rejected, (state) => {
      state.loading = false;
    });
  },
});

export default statSlice.reducer;
