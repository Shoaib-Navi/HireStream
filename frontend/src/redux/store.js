import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import jobSlice from "./jobSlice";
import applicationSlice from "./applicationSlice";
import companySlice from "./companySlice";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

// Only the logged-in user is persisted. Jobs, companies and applicants are always
// fetched fresh, so stale data never survives a reload.
const authPersistConfig = {
  key: "auth",
  version: 1,
  storage,
  whitelist: ["user"],
};

// Remove the old snapshot of the whole store saved by previous versions
try {
  localStorage.removeItem("persist:root");
} catch {
  // storage unavailable (e.g. private mode)
}

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authSlice),
  job: jobSlice,
  company: companySlice,
  application: applicationSlice,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;
