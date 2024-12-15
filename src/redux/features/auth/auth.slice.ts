import { ResponseError } from "@/@types/error.type";
import axiosInstance from "@/utils/config/axios.config";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { initialState } from "@/@types/state.type";
import {
  IAuth,
  IAuthRegister,
  IAuthRegisterResponse,
} from "@/@types/auth.type";
import { IDataResponse } from "@/@types/pagination";
import { IProfile } from "@/@types/profile.type";
import Secure from "@/utils/helpers/secureLS";

export const authRegister = createAsyncThunk(
  "auth/register",
  async (user: IAuthRegister & { otp: string }) => {
    const { Signature, ...rest } = user.profile;
    try {
      const { data } = await axiosInstance.post<
        IDataResponse<IAuthRegisterResponse>
      >("/auth/register", {
        ...user,
        profile: rest,
      });
      return data.data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const authLogin = createAsyncThunk(
  "auth/login",
  async (credentials: IAuth & { otp: string }) => {
    try {
      const { data } = await axiosInstance.post<
        IDataResponse<IAuthRegisterResponse>
      >("/auth/login", credentials);
      return data.data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/reset",
  async (credentials: IAuth & { otp: string }) => {
    try {
      const { data } = await axiosInstance.post<
        IDataResponse<IAuthRegisterResponse>
      >("/auth/reset-password", credentials);
      return data.data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const authLogout = createAsyncThunk("auth/logout", async () => {
  try {
    const res = await axiosInstance.post("/auth/logout");
    return res.data;
  } catch (error) {
    const err = error as ResponseError;
    const message = err.response?.data.message || err.message;
    throw new Error(message);
  }
});

export const verifyUser = createAsyncThunk(
  "auth/verify",
  async ({ id, code }: { id: string; code: string }) => {
    try {
      const res = await axiosInstance.post(`/users/${id}/verify`, {
        code,
      });
      return res.data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const resendVerification = createAsyncThunk(
  "auth/resend",
  async (id) => {
    try {
      const res = await axiosInstance.post(`/users/${id}/resend-code`);
      return res.data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgot",
  async (username: string) => {
    try {
      const res = await axiosInstance.post("/auth/forgot-password", {
        username,
      });
      return res.data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const getNidaData = createAsyncThunk(
  "auth/nida",
  async (nationalID: string) => {
    try {
      const res = await axiosInstance.post<IProfile>(`/nida/${nationalID}`);
      if (!res.data) throw new Error("No data found");
      return res.data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const sendSMS = createAsyncThunk(
  "auth/sms",
  async ({ phone, checkUser }: { phone: string; checkUser?: boolean }) => {
    try {
      let url = `/otp`;

      if (checkUser) {
        url = `/otp?checkUser=true`;
      }

      const { data } = await axiosInstance.post<{ message: string }>(url, {
        phone,
      });
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const getParcelInfo = createAsyncThunk(
  "auth/parcel",
  async (parcelId: string) => {
    try {
      const { data } = await axiosInstance.post<ILandData>(`/land`, {
        parcelId,
      });
      return data;
    } catch (error) {
      const err = error as ResponseError;
      const message = err.response?.data.message || err.message;
      throw new Error(message);
    }
  }
);

export const requestOTP = createAsyncThunk(
  "auth/requestOTP",
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
  "auth/verifyOTP",
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

const authSlice = createSlice({
  name: "auth",
  initialState: initialState<IAuthRegister | null>(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(authRegister.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(authRegister.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(authRegister.rejected, (state, action) => {
      state.error = action.error.message;
      state.loading = false;
    });

    builder.addCase(authLogin.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(authLogin.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(authLogin.rejected, (state, action) => {
      state.error = action.error.message;
      state.loading = false;
    });

    builder.addCase(authLogout.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(authLogout.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(authLogout.rejected, (state, action) => {
      state.error = action.error.message;
      state.loading = false;
    });

    builder.addCase(verifyUser.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(verifyUser.fulfilled, (state, action) => {
      state.data = action.payload;
    });
    builder.addCase(verifyUser.rejected, (state, action) => {
      state.error = action.error.message;
      state.loading = false;
    });

    builder.addCase(resendVerification.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(resendVerification.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(resendVerification.rejected, (state, action) => {
      state.error = action.error.message;
      state.loading = false;
    });

    builder.addCase(forgotPassword.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(forgotPassword.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.error = action.error.message;
      state.loading = false;
    });

    builder.addCase(getNidaData.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(getNidaData.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(getNidaData.rejected, (state, action) => {
      state.error = action.error.message;
      state.loading = false;
    });

    builder.addCase(sendSMS.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(sendSMS.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(sendSMS.rejected, (state, action) => {
      state.error = action.error.message;
      state.loading = false;
    });

    builder.addCase(getParcelInfo.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(getParcelInfo.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(getParcelInfo.rejected, (state, action) => {
      state.error = action.error.message;
      state.loading = false;
    });

    builder.addCase(resetPassword.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(resetPassword.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.error = action.error.message;
      state.loading = false;
    });

    builder.addCase(requestOTP.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(requestOTP.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(requestOTP.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
    });

    builder.addCase(verifyOTP.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(verifyOTP.fulfilled, (state) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.otpVerified = true;
      if (state.user) {
        Secure.setToken(state.user._id);
        Secure.setUser(state.user);
      }
    });
    builder.addCase(verifyOTP.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
    });
  },
});

export default authSlice.reducer;
