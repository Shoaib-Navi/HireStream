import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import { loggedOut, sessionExpired } from "./authActions";
import { authApi } from "./api";

const initialState = {
  user: null,
  // true once /auth/me has answered on this page load (not persisted)
  sessionChecked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userUpdated: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sessionExpired, (state) => {
        state.user = null;
      })
      .addCase(loggedOut, (state) => {
        state.user = null;
      })
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.sessionChecked = true;
      })
      .addMatcher(authApi.endpoints.getMe.matchRejected, (state, action) => {
        // skipped/deduplicated requests also "reject"; only real answers count
        if (action.meta.condition) return;
        state.sessionChecked = true;
      })
      .addMatcher(
        isAnyOf(authApi.endpoints.login.matchFulfilled, authApi.endpoints.register.matchFulfilled),
        (state, { payload }) => {
          state.user = payload.user;
          state.sessionChecked = true;
        },
      );
  },
});

export const { userUpdated } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectSessionChecked = (state) => state.auth.sessionChecked;

export default authSlice.reducer;
