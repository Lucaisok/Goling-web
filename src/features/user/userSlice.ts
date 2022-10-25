import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    id: "",
    username: "",
    first_name: "",
    last_name: "",
    loggedIn: false
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        userLoggedIn(state, action) {
            const { id, username, first_name, last_name } = action.payload;
            state.id = id;
            state.username = username;
            state.first_name = first_name;
            state.last_name = last_name;
            state.loggedIn = true;
        },
        userLoggedOut(state) {
            state.id = "";
            state.username = "";
            state.first_name = "";
            state.last_name = "";
            state.loggedIn = false;
        },
    }
});

export const { userLoggedIn, userLoggedOut } = userSlice.actions;

export default userSlice.reducer;