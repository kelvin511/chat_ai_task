import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    userId: string;
    userName: string;
}

interface UsersState {
    onlineUsers: User[];
}

const initialState: UsersState = {
    onlineUsers: [],
};

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setOnlineUsers: (state, action: PayloadAction<User[]>) => {
            state.onlineUsers = action.payload;
        },
    },
});

export const { setOnlineUsers } = usersSlice.actions;
export default usersSlice.reducer;
