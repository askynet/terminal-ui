'use client';

import { CenterLoader } from "@/components/CenterLoader";
import TerminalWindow from "@/components/Terminal/TerminalWindow";
import TopLinerLoader from "@/components/TopLineLoader";
import AppSidebar from "@/layout/AppSiderbar";
import { LayoutWrapper } from "@/layout/LayoutWrapper";
import { focusTab, removeTab, TabItem } from "@/redux/slices/tabSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { Button } from "primereact/button";
import { TabPanel, TabView } from "primereact/tabview";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoggedIn } = useSelector((state: RootState) => state.auth);
    const { focusedTab, tabs } = useSelector((state: RootState) => state.tabs);

    const onRemove = (tabId: any) => {
        dispatch(removeTab(tabId))
    }

    if (!isLoggedIn) {
        return <CenterLoader />
    }

    return <React.Fragment>
        <LayoutWrapper>
            <TopLinerLoader />
            <div className="wrapper flex"
                style={{
                    height: "100vh"
                }}>
                <AppSidebar />
                <div style={{ width: '100vw' }} className={'page-container'}>
                    {children}
                </div>
            </div>
        </LayoutWrapper>
    </React.Fragment>
}
