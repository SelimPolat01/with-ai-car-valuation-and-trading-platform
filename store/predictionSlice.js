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
    trimLevel: "",
    price: "",
    hasScratch: "",
    hasDent: "",
    daysToSell: "",
    plate: "",
    chasisNumber: "",
    tramerRecord: "",
    inspectionDate: "",
    ownerCount: "",
    hasPledge: "",
    hasServiceMaintence: "",
    hasWarrenty: "",
    hasSpareKey: "",
    tireType: "",
    tireCondition: "",
    extras: "",
    lpgStatus: "",
    files: [],
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
