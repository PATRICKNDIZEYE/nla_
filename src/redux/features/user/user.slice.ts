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

export const suspendAccount = createAsyncThunk(
  "user/suspendAccount",
  async (params: { userId: string; reason: string }) => {
    try {
      const { data } = await axiosInstance.post<IDataResponse<IAuthRegister>>(
        `/users/${params.userId}/suspend`,
        {
          suspendedBy: Secure.getUserId(),
          reason: params.reason,
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

export const reactivateAccount = createAsyncThunk(
  "user/reactivateAccount",
  async (userId: string) => {
    try {
      const { data } = await axiosInstance.post<IDataResponse<IAuthRegister>>(
        `/users/${userId}/reactivate`,
        {
          reactivatedBy: Secure.getUserId(),
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

export const switchAccount = createAsyncThunk(
  "user/switchAccount",
  async (params: { userId: string; targetRole: 'user' | 'manager' }) => {
    try {
      const { data } = await axiosInstance.post<IDataResponse<IAuthRegister>>(
        `/users/${params.userId}/switch-account`,
        {
          targetRole: params.targetRole,
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

export const requestOTP = createAsyncThunk(
  "user/requestOTP",
  async (params: { userId: string; method: 'sms' | 'email' | 'both' }) => {
    try {
      const { data } = await axiosInstance.post<IDataResponse<{ success: boolean }>>(
        `/users/${params.userId}/otp`,
        {
          method: params.method,
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

export const verifyOTP = createAsyncThunk(
  "user/verifyOTP",
  async (params: { userId: string; otp: string }) => {
    try {
      const { data } = await axiosInstance.put<IDataResponse<{ success: boolean }>>(
        `/users/${params.userId}/otp`,
        {
          otp: params.otp,
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

export const getCaseCounts = createAsyncThunk(
  "user/getCaseCounts",
  async (userId: string) => {
    try {
      const { data } = await axiosInstance.get<IDataResponse<{
        _id: string;
        counts: Record<string, number>;
      }>>(`/disputes/statistics/case-counts?userId=${userId}`);
      return data.data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

interface UserState {
  data: {
    data: IAuthRegister[];
    pagination: {
      totalItems: number;
      totalPages: number;
    };
    singleData: IAuthRegister | null;
  };
  caseCounts: Record<string, Record<string, number>>;
  loading: boolean;
  error: string | null;
  profile: IAuthRegister | null;
}

const initialState: UserState = {
  data: {
    data: [],
    pagination: {
      totalItems: 0,
      totalPages: 0,
    },
    singleData: null,
  },
  caseCounts: {},
  loading: false,
  error: null,
  profile: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser: () => initialState,
    updateSingleUser: (state, action: { payload: IAuthRegister }) => {
      state.data.singleData = action.payload;
    },
    setProfile: (state, { payload }: { payload: IAuthRegister }) => {
      state.profile = payload;
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

    // Suspend Account
    builder.addCase(suspendAccount.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(suspendAccount.fulfilled, (state, action) => {
      state.loading = false;
      // Update user in list if exists
      if (state.data.data) {
        state.data.data = state.data.data.map((user) =>
          user._id === action.payload.data._id ? action.payload.data : user
        );
      }
    });
    builder.addCase(suspendAccount.rejected, (state) => {
      state.loading = false;
    });

    // Reactivate Account
    builder.addCase(reactivateAccount.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(reactivateAccount.fulfilled, (state, action) => {
      state.loading = false;
      // Update user in list if exists
      if (state.data.data) {
        state.data.data = state.data.data.map((user) =>
          user._id === action.payload.data._id ? action.payload.data : user
        );
      }
    });
    builder.addCase(reactivateAccount.rejected, (state) => {
      state.loading = false;
    });

    // Switch Account
    builder.addCase(switchAccount.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(switchAccount.fulfilled, (state, action) => {
      state.loading = false;
      // Update user in list if exists
      if (state.data.data) {
        state.data.data = state.data.data.map((user) =>
          user._id === action.payload.data._id ? action.payload.data : user
        );
      }
    });
    builder.addCase(switchAccount.rejected, (state) => {
      state.loading = false;
    });

    // Request OTP
    builder.addCase(requestOTP.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(requestOTP.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(requestOTP.rejected, (state) => {
      state.loading = false;
    });

    // Verify OTP
    builder.addCase(verifyOTP.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(verifyOTP.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(verifyOTP.rejected, (state) => {
      state.loading = false;
    });

    // Case Counts
    builder.addCase(getCaseCounts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCaseCounts.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.error = null;
      if (payload && payload._id) {
        state.caseCounts = {
          ...state.caseCounts,
          [payload._id]: payload.counts || {}
        };
      }
    });
    builder.addCase(getCaseCounts.rejected, (state, { error }) => {
      state.loading = false;
      state.error = error.message || null;
    });
  },
});

export const { clearUser, updateSingleUser, setProfile } = userSlice.actions;

export default userSlice.reducer;
