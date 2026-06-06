import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allAdverts: [],
  filteredAdverts: [],
  favoriteAdverts: [],
  selectedBrand: null,
};

const advertsSlice = createSlice({
  name: "adverts",
  initialState,
  reducers: {
    setAdverts: (state, action) => {
      state.allAdverts = action.payload;
      state.filteredAdverts = action.payload;
      state.selectedBrand = null;
    },
    setFilterAdverts: (state, action) => {
      const brand = action.payload;
      state.selectedBrand = brand;
      if (!brand) {
        state.filteredAdverts = state.allAdverts;
      } else {
        state.filteredAdverts = state.allAdverts.filter(
          (advert) => advert.brand === brand,
        );
      }
    },
    setFavorites: (state, action) => {
      state.favoriteAdverts = action.payload;
    },
    toggleFavorite: (state, action) => {
      const { advert, isFavorite } = action.payload;
      if (isFavorite) {
        state.favoriteAdverts.push(advert);
      } else {
        state.favoriteAdverts = state.favoriteAdverts.filter(
          (favoriteAdvert) => favoriteAdvert.id !== advert.id,
        );
      }
    },
  },
});

export const { setAdverts, setFilterAdverts, setFavorites, toggleFavorite } =
  advertsSlice.actions;
export default advertsSlice.reducer;
