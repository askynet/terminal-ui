'use client';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import TerminalWindow from '@/components/Terminal/TerminalWindow';
import AppPage from '@/layout/AppPage';
import { useAppContext } from '@/layout/AppWrapper';
import { useLayoutContext } from '@/layout/LayoutWrapper';
import { RootState } from '@/redux/store';
import { TabItem } from '@/redux/slices/tabSlice';


const TerminalPage = () => {
    const { isLoading, setLoading, setScroll, setAlert } = useAppContext();
    const { layoutState } = useLayoutContext();

    const { user } = useSelector((state: RootState) => state.auth);
    const { tabs, focusedTab } = useSelector((state: RootState) => state.tabs);

    useEffect(() => {
        setScroll(false)
        return () => {
            setScroll(true)
        }
    }, [])

    return <AppPage isLogo={true} full={true} containerClass='p-0'>
        {
            tabs.map((tab: TabItem, index: any) => <TerminalWindow
                key={tab.tabId}
                id={tab.tabId}
                isActive={tab.tabId === focusedTab}
                user={user}
            />
            )
        }
    </AppPage>
}
export default TerminalPage;
