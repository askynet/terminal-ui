'use client';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import TerminalWindow from '@/components/Terminal/TerminalWindow';
import AppPage from '@/layout/AppPage';
import { useAppContext } from '@/layout/AppWrapper';
import { RootState } from '@/redux/store';
import { TabItem } from '@/redux/slices/tabSlice';
import DesktopOnlyOverlay from '@/components/DesktopOnlyOverlay';

const TerminalPage = () => {
    const { setScroll } = useAppContext();
    const { tabs, focusedTab } = useSelector((state: RootState) => state.tabs);

    useEffect(() => {
        setScroll(false)
        return () => {
            setScroll(true)
        }
    }, [])


    console.log('focusedTab', focusedTab, tabs)

    return <AppPage isLogo={true} full={true} containerClass='p-0'>
        {
            tabs.map((tab: TabItem, index: any) => <TerminalWindow
                key={tab.tabId}
                id={tab.tabId}
                isActive={tab.tabId === focusedTab}
            />
            )
        }
        {/* Placeholder if no tab selected */}
        {focusedTab === null && (
            <div
                style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#666",
                    fontStyle: "italic",
                }}
            >
                Please select a tab to view content.
            </div>
        )}
    </AppPage>
}
export default TerminalPage;
