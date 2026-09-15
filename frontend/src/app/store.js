import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "@/features/auth/authSlice";
import { baseApi } from "@/services/api";

const AUTH_STATE_VERSION = 2;

// Only the logged-in user is persisted; server data is always fetched fresh through RTK Query
const authPersistConfig = {
  key: "auth",
  version: AUTH_STATE_VERSION,
  storage,
  whitelist: ["user"],
  // users saved by older versions have a different shape: start fresh and let /auth/me restore them
  migrate: (state) =>
    Promise.resolve(state?._persist?.version === AUTH_STATE_VERSION ? state : undefined),
};

try {
  // snapshot of the whole store saved by the first version of the app
  localStorage.removeItem("persist:root");
} catch {
  // storage unavailable (e.g. private mode)
}

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  [baseApi.reducerPath]: baseApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // upload mutations keep the File they were called with
        ignoredPaths: [`${baseApi.reducerPath}.mutations`],
      },
    }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

// refetch on reconnect / window focus where endpoints opt in
setupListeners(store.dispatch);
