import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TabItem {
    tabId?: any;
    title?: any;
}

interface TabState {
    focusedTab: any;
    tabs: TabItem[]
}

const initialState: TabState = {
    focusedTab: null,
    tabs: []
};

const tabSlice = createSlice({
    name: 'tabSlice',
    initialState,
    reducers: {
        setTabs(state, action: PayloadAction<TabItem[]>) {
            state.tabs = action.payload;
        },
        clearTabs(state) {
            state.tabs = [];
        },
        addTab(state, action: PayloadAction<TabItem>) {
            state.tabs.push(action.payload);
        },
        removeTab(state, action: PayloadAction<any>) {
            const tabIndex = state.tabs.findIndex(tab => tab.tabId == action.payload);
            // If the removed tab was focused, reset focus
            if (state.focusedTab === state.tabs[tabIndex].tabId && tabIndex > 0) {
                state.focusedTab = state.tabs[tabIndex - 1].tabId;
            }
            state.tabs = state.tabs.filter(tab => tab.tabId !== action.payload);

        },
        focusTab(state, action: PayloadAction<any>) {
            state.focusedTab = action.payload;
        },
    },
});

export const { setTabs, clearTabs, addTab, removeTab, focusTab } = tabSlice.actions;
export default tabSlice.reducer;
