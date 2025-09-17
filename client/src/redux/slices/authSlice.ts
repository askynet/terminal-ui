import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    isLoggedIn?: boolean;
    user: any;
    authToken: any;
    authRefreshToken: any;
    permissions: any[]
}

const initialState: AuthState = {
    isLoggedIn: false,
    user: undefined,
    authToken: undefined,
    authRefreshToken: undefined,
    permissions: []
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<any>) {
            state.isLoggedIn = true;
            state.user = action.payload.user;
            state.authToken = action.payload.token;
            state.authRefreshToken = action.payload.refreshToken;
        },
        logout(state) {
            state.isLoggedIn = false;
            state.user = null;
            state.authToken = null;
            state.authRefreshToken = null;
            state.permissions = [];
        },
        setPermissions(state, action: PayloadAction<string[]>) {
            state.permissions = action.payload;
        },
        clearPermissions(state) {
            state.permissions = [];
        },
        setAuthToken(state, action: PayloadAction<string>) {
            state.authToken = action.payload;
        },
        setAuthRefreshToken(state, action: PayloadAction<string>) {
            state.authRefreshToken = action.payload;
        },
    },
});

export const { login, logout, setPermissions, clearPermissions, setAuthToken, setAuthRefreshToken } = authSlice.actions;
export default authSlice.reducer;
