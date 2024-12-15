import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authSlice from "./features/auth/auth.slice";
import userSlice from "./features/user/user.slice";
import disputeSlice from "./features/dispute/dispute.slice";
import appealSlice from "./features/dispute/appeal.slice";
import logSlice from "./features/log/log.slice";
import invitationSlice from "./features/invitation.slice";
import profileSlice from "./features/user/profile.slice";
import statisticsSlice from "./features/statistics.slice";
import chatSlice from "./features/chat/chat.slice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    dispute: disputeSlice,
    appeal: appealSlice,
    log: logSlice,
    stat: statisticsSlice,
    invitation: invitationSlice,
    profile: profileSlice,
    chat: chatSlice,
  },
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: [
          "payload.config",
          "payload.request",
          "error",
          "meta.arg",
        ],
      },
    });
  },
});

export type IRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<IRootState> = useSelector;
export const useAppDispatch = () => {
  return useDispatch<AppDispatch>();
};

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  IRootState,
  unknown,
  Action
>;
