'use client';

import { CenterLoader } from "@/components/CenterLoader";
import AppPage from "@/layout/AppPage";
import { focusTab } from "@/redux/slices/tabSlice";
import { AppDispatch, RootState } from "@/redux/store";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function TerminalLayout({ children }: AppLayoutProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoggedIn } = useSelector((state: RootState) => state.auth);
    const { focusedTab, tabs } = useSelector((state: RootState) => state.tabs);

    if (!isLoggedIn) {
        return <CenterLoader />
    }

    useEffect(() => {
        dispatch(focusTab(0))
    }, [])

    return <AppPage>
        <p>Home</p>
    </AppPage>
}
