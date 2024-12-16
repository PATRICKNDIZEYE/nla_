import { initialState } from "@/@types/state.type";
import { ResponseError } from "@/@types/error.type";
import {
  IDistrictData,
  ILevelData,
  IMonthData,
  ISectorData,
  IStatusData,
} from "@/@types/pagination";
import axiosInstance from "@/utils/config/axios.config";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Secure from "@/utils/helpers/secureLS";

const userId = Secure.getUserId();

export const getDistrictStats = createAsyncThunk(
  "stat/getDistrictStats",
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    try {
      let query = `/disputes/statistics/count-district-status?userId=${userId}`;
      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const { data } = await axiosInstance.get<IDistrictData[]>(query);
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const getSectorStats = createAsyncThunk(
  "stat/getSectorStats",
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    try {
      let query = `/disputes/statistics/count-sector-status?userId=${userId}`;

      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const { data } = await axiosInstance.get<ISectorData[]>(query);
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const getMonthStats = createAsyncThunk(
  "stat/getMonthStats",
  async ({ startDate, endDate, userId, role }: { 
    startDate?: string; 
    endDate?: string;
    userId: string;
    role?: string;
  }) => {
    try {
      let query = `/disputes/statistics/count-status-month?userId=${userId}`;
      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }
      if (role) {
        query += `&role=${role}`;
      }
      console.log('Fetching month stats with query:', query);
      const { data } = await axiosInstance.get<IMonthData[]>(query);
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const getLevelStats = createAsyncThunk(
  "stat/getLevelStats",
  async ({ startDate, endDate, userId, role }: { 
    startDate?: string; 
    endDate?: string;
    userId: string;
    role?: string;
  }) => {
    try {
      let query = `/disputes/statistics/count-level?userId=${userId}`;
      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }
      if (role) {
        query += `&role=${role}`;
      }
      console.log('Fetching level stats with query:', query);
      const { data } = await axiosInstance.get<ILevelData>(query);
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const getStatusStats = createAsyncThunk(
  "stat/getStatusStats",
  async ({ startDate, endDate, userId, role }: { 
    startDate?: string; 
    endDate?: string;
    userId: string;
    role?: string;
  }) => {
    try {
      let query = `/disputes/statistics/count-status?userId=${userId}`;
      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }
      if (role) {
        query += `&role=${role}`;
      }
      console.log('Fetching status stats with query:', query);
      const { data } = await axiosInstance.get<IStatusData>(query);
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export interface IStat {
  level: ILevelData;
  status: IStatusData;
  sectors: ISectorData[];
  districts: IDistrictData[];
  month: IMonthData[];
}

const statSlice = createSlice({
  name: "stat",
  initialState: initialState<IStat>(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getDistrictStats.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getDistrictStats.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.data.districts = payload;
    });
    builder.addCase(getDistrictStats.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(getSectorStats.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getSectorStats.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.data.sectors = payload;
    });
    builder.addCase(getSectorStats.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(getMonthStats.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getMonthStats.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.data.month = payload;
    });
    builder.addCase(getMonthStats.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(getLevelStats.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getLevelStats.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.data.level = payload;
    });
    builder.addCase(getLevelStats.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(getStatusStats.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getStatusStats.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.data.status = payload;
    });
    builder.addCase(getStatusStats.rejected, (state) => {
      state.loading = false;
    });
  },
});

export default statSlice.reducer;
