import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import advertsReducer from "./advertsSlice";
import predictionReducer from "./predictionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adverts: advertsReducer,
    prediction: predictionReducer,
  },
});
