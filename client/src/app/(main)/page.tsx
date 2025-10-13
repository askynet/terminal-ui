'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TerminalWindow from '@/components/Terminal/TerminalWindow';
import AppPage from '@/layout/AppPage';
import { useAppContext } from '@/layout/AppWrapper';
import { AppDispatch, RootState } from '@/redux/store';
import { v4 as uuidv4 } from 'uuid';
import { addTab, focusTab, TabItem } from '@/redux/slices/tabSlice';

const TerminalPage = () => {
    const { setScroll, theme } = useAppContext();
    const { tabs, focusedTab } = useSelector((state: RootState) => state.tabs);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        setScroll(false)
        return () => {
            setScroll(true)
        }
    }, [])

    const addNewTab = () => {
        const newTabId = uuidv4();
        dispatch(addTab({
            tabId: newTabId,
            title: "New Terminal"
        }))
        dispatch(focusTab(newTabId))
    }

    const filter = theme === "dark"
        ? "invert(1) sepia(1) saturate(5) hue-rotate(180deg)"
        : "invert(0)";
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
        {(focusedTab === null || tabs.length === 0) && <div className="flex flex-column justify-content-center align-items-center text-center" style={{ height: "80vh" }}>

            <span onClick={() => addNewTab()} className="mx-3 plus-terminal flex cursor-pointer w-5rem h-5rem border-round-2xl  align-items-center justify-content-center mb-4">
                <img src={'/conn.svg'} style={{ width: 50, height: 50, filter }} />
            </span>
            <p className='text-2xl font-bold mb-2'>Recent sessions</p>
            <p className='mb-2'>Your recent sessions will be visible here.</p>
            <p className='flex justify-content-center align-items-center text-center'>
                In the meantime, start connecting by clicking {<span onClick={() => addNewTab()} className="mx-3 plus-terminal flex cursor-pointer w-2rem h-2rem border-round  align-items-center justify-content-center">
                    <i className={`pi pi-plus text-100`} />
                </span>} button
            </p>
        </div>}
    </AppPage>
}
export default TerminalPage;
