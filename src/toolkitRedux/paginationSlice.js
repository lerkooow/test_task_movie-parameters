import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentPage: 1,
};

const paginationSlice = createSlice({
    name: 'pagination',
    initialState,
    reducers: {
        setPage: (state, action) => {
            state.currentPage = action.payload;
        },
    },
});

export const { setPage } = paginationSlice.actions;
export default paginationSlice.reducer;
