import { configureStore } from '@reduxjs/toolkit';
import paginationReducer from './paginationSlice';

export const store = configureStore({
    reducer: {
        pagination: paginationReducer,
    },
});