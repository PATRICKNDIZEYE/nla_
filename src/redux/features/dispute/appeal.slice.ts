import { IAppeal } from "@/@types/dispute.type";
import { ResponseError } from "@/@types/error.type";
import {
  IDataResponse,
  IPaginatedData,
  TableParams,
} from "@/@types/pagination";
import { initialPaginatedState } from "@/@types/state.type";
import axiosInstance from "@/utils/config/axios.config";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const getAllAppeals = createAsyncThunk(
  "dispute/getAllAppeals",
  async (params: TableParams) => {
    try {
      let query = "/appeals";
      if (params) {
        query += `?page=${params.pagination?.current}&limit=${params.pagination?.pageSize}`;
        if (params.search) {
          query += `&search=${params.search}`;
        }
        if (params.role) {
          query += `&role=${params.role}`;
        }
        if (params.userId) {
          query += `&_id=${params.userId}`;
        }
        if (params.status) {
          query += `&status=${params.status}`;
        }
      }
      const { data } = await axiosInstance.get<IPaginatedData<IAppeal>>(query);
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const getAppealById = createAsyncThunk(
  "dispute/getAppealById",
  async (id: string) => {
    try {
      const { data } = await axiosInstance.get<IDataResponse<IAppeal>>(
        `/appeals/${id}`
      );
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const createAppeal = createAsyncThunk(
  "dispute/createAppeal",
  async (payload: FormData) => {
    try {
      const { data } = await axiosInstance.post<IDataResponse<IAppeal>>(
        "/appeals",
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

const initialState = initialPaginatedState<IAppeal>();

const appealSlice = createSlice({
  name: "appeal",
  initialState,
  reducers: {
    clearAppeal: () => initialState,
    setSingleAppeal: (
      state,
      {
        payload,
      }: {
        payload: IAppeal;
      }
    ) => {
      state.data.singleData = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllAppeals.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllAppeals.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.data = payload;
    });
    builder.addCase(getAllAppeals.rejected, (state, { error }) => {
      state.loading = false;
      state.error = error.message;
    });
    builder.addCase(getAppealById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAppealById.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.data.singleData = payload.data;
      state.data.data = state.data.data.map((dispute) => {
        if (dispute._id === payload.data._id) {
          return payload.data;
        }
        return dispute;
      });
    });
    builder.addCase(getAppealById.rejected, (state, { error }) => {
      state.loading = false;
      state.error = error.message;
    });
    builder.addCase(createAppeal.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createAppeal.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.data.data.unshift(payload.data);
    });
    builder.addCase(createAppeal.rejected, (state, { error }) => {
      state.loading = false;
      state.error = error.message;
    });
  },
});

export const { clearAppeal, setSingleAppeal } = appealSlice.actions;

export default appealSlice.reducer;
