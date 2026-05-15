import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  prediction: {
    brand: "",
    model: "",
    modelYear: "",
    bodyType: "",
    engineCapacity: "",
    horsepower: "",
    transmission: "",
    kilometer: "",
    fuelType: "",
    changedPartCount: "",
    price: "",
  },
};

const predictionSlice = createSlice({
  name: "prediction",
  initialState,
  reducers: {
    setPrediction: (state, action) => {
      state.prediction = action.payload;
    },
  },
});

export const { setPrediction } = predictionSlice.actions;
export default predictionSlice.reducer;
