
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { addTab, focusTab, removeTab, TabItem } from '@/redux/slices/tabSlice';
import { v4 as uuidv4 } from 'uuid';

export default function TabsComponent() {
    const dispatch = useDispatch<AppDispatch>();
    const { tabs, focusedTab } = useSelector((state: RootState) => state.tabs);
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);

    const addNewTab = () => {
        const newTabId = uuidv4();
        dispatch(addTab({
            tabId: newTabId,
            title: "New Terminal"
        }))
        dispatch(focusTab(newTabId))
    }

    const deleteTab = (tabId: any) => {
        dispatch(removeTab(tabId))
    }

    const setFocus = (tabId: any) => {
        dispatch(focusTab(tabId));
    }

    return <div className='flex align-items-center gap-2'>
        {
            tabs.map((tab: TabItem, index: any) => <div
                key={`tabs${index}${tab.tabId}`}
                className={`flex align-items-center cursor-pointer border-round p-2 transition-all animation-duration-100 ${tab.tabId == focusedTab ? 'bg-primary' : ''}`}
                style={{ backgroundColor: 'var(--surface-200)', width: '18vw' }}
                onMouseEnter={() => setHoveredTab(tab.tabId)}
                onMouseLeave={() => setHoveredTab(null)}
                onClick={() => setFocus(tab.tabId)}
            >
                <i
                    className={`pi ${hoveredTab === tab.tabId && index != 0 ? "pi-times" : "pi-plus"} mr-2`}
                    onClick={() => index != 0 && deleteTab(tab.tabId)}
                ></i>
                {tab.title}
            </div>)
        }
        {
            tabs.length < 5 && <span onClick={() => addNewTab()} className="plus-terminal flex cursor-pointer w-2rem h-2rem border-round  align-items-center justify-content-center">
                <i className={`pi pi-plus text-100`} />
            </span>
        }
    </div>
}
