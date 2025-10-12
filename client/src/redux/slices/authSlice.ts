import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TernimalConfig {
    lanId: any;
    passwordToken: any;
    isLoggedIn: boolean;
}

const initialState: TernimalConfig = {
    lanId: null,
    passwordToken: null,
    isLoggedIn: false
};

const terminalSlice = createSlice({
    name: 'terminalSlice',
    initialState,
    reducers: {
        setTerminalConfig(state, action: PayloadAction<TernimalConfig>) {
            state = {
                ...action.payload,
                isLoggedIn: true
            };
            return state;
        },
        clearTerminalConfig(state) {
            state = {
                ...state,
                passwordToken: null,
                isLoggedIn: false
            };
            return state;
        }
    },
});

export const { setTerminalConfig, clearTerminalConfig } = terminalSlice.actions;
export default terminalSlice.reducer;

