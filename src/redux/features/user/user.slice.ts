import { IAuthRegister } from "@/@types/auth.type";
import { ResponseError } from "@/@types/error.type";
import {
  IDataResponse,
  IPaginatedData,
  TableParams,
} from "@/@types/pagination";
import { initialPaginatedState } from "@/@types/state.type";
import axiosInstance from "@/utils/config/axios.config";
import Secure from "@/utils/helpers/secureLS";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (params: TableParams) => {
    try {
      let query = "/users";
      if (params) {
        query += `?page=${params.pagination?.current}&limit=${params.pagination?.pageSize}`;
        if (params.search) {
          query += `&search=${params.search}`;
        }
        if (params.role) {
          query += `&role=${params.role}`;
        }
        if (params.userId) {
          query += `&userId=${params.userId}`;
        }
      }
      const { data } = await axiosInstance.get<IPaginatedData<IAuthRegister>>(
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

export const getUserById = createAsyncThunk(
  "user/getUserById",
  async (id: string) => {
    try {
      const { data } = await axiosInstance.get<IDataResponse<IAuthRegister>>(
        `/users/${id}`
      );
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const createUser = createAsyncThunk(
  "user/createUser",
  async (payload: IAuthRegister) => {
    try {
      const { data } = await axiosInstance.post<IDataResponse<IAuthRegister>>(
        "/users",
        payload
      );
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (payload: IAuthRegister) => {
    try {
      const { data } = await axiosInstance.put<IDataResponse<IAuthRegister>>(
        `/users/${payload._id}?updatedBy=${Secure.getUserId()}`,
        payload
      );
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (id: string) => {
    try {
      await axiosInstance.delete<IDataResponse<IAuthRegister>>(`/users/${id}`);
      return id;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const changeUserLevel = createAsyncThunk(
  "user/changeUserLevel",
  async (payload: any) => {
    try {
      const { data } = await axiosInstance.put<IDataResponse<IAuthRegister>>(
        `/users/${payload.userId}?updatedBy=${Secure.getUserId()}`,
        payload
      );
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

const initialState = initialPaginatedState<IAuthRegister>();

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser: () => initialState,
    updateSingleUser: (
      state,
      action: {
        payload: IAuthRegister;
      }
    ) => {
      state.data.singleData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllUsers.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(getAllUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(getUserById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getUserById.fulfilled, (state, action) => {
      state.loading = false;
      state.data.singleData = action.payload.data;
    });
    builder.addCase(getUserById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(createUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createUser.fulfilled, (state, action) => {
      state.loading = false;
      state.data.data.unshift(action.payload.data);
      state.data.pagination.totalItems += 1;
    });
    builder.addCase(createUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(updateUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.loading = false;
      state.data.singleData = action.payload.data;
      state.data.data = state.data.data.map((user) => {
        if (user._id === action.payload.data._id) {
          return action.payload.data;
        }
        return user;
      });
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(deleteUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.loading = false;
      state.data.data = state.data.data.filter(
        (user) => user._id !== action.payload
      );
    });
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    builder.addCase(changeUserLevel.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(changeUserLevel.fulfilled, (state, action) => {
      state.loading = false;
      state.data.singleData = action.payload.data;
      state.data.data = state.data.data.map((user) => {
        if (user._id === action.payload.data._id) {
          return action.payload.data;
        }
        return user;
      });
    });
    builder.addCase(changeUserLevel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  },
});

export const { clearUser, updateSingleUser } = userSlice.actions;

export default userSlice.reducer;
