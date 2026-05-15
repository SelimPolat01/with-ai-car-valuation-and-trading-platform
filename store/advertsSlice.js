import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allAdverts: [],
  filteredAdverts: [],
  favoriteAdverts: [],
};

const advertsSlice = createSlice({
  name: "adverts",
  initialState,
  reducers: {
    setAdverts: (state, action) => {
      state.allAdverts = action.payload;
      state.filteredAdverts = action.payload;
    },
    setFilterAdverts: (state, action) => {
      state.filteredAdverts = state.allAdverts.filter(
        (advert) => advert.brand === action.payload
      );
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
          (favoriteAdvert) => favoriteAdvert.id !== advert.id
        );
      }
    },
  },
});

export const { setAdverts, setFilterAdverts, setFavorites, toggleFavorite } =
  advertsSlice.actions;
export default advertsSlice.reducer;
