import { IAuthRegister } from "@/@types/auth.type";
import { ResponseError } from "@/@types/error.type";
import { IDataResponse } from "@/@types/pagination";
import { initialState } from "@/@types/state.type";
import axiosInstance from "@/utils/config/axios.config";
import Secure from "@/utils/helpers/secureLS";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const myProfile = createAsyncThunk("user/myProfile", async () => {
  try {
    const { data } = await axiosInstance.get<IDataResponse<IAuthRegister>>(
      `/users/${Secure.getUserId()}`
    );
    const token = Secure.getToken();
    // Get the cureent session
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: token }),
    });
  
    const session = await res.json();
    // Use  the role from session instead of the role from database
    return {
      ...data,
      data: {
        ...data.data,
        level: {
          ...data.data.level,
          role: session.user.role,
         accountRole:data?.data?.level?.role
        },
      },
    };
  } catch (error) {
    const err = error as ResponseError;
    const message = err.response?.data.message || err.message;
    throw new Error(message);
  }
});

const profileSlice = createSlice({
  name: "user",
  initialState: initialState<IAuthRegister>(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(myProfile.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(myProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload.data;
    });
    builder.addCase(myProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  },
});

export default profileSlice.reducer;
