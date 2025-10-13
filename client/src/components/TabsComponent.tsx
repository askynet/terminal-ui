
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { addTab, focusTab, removeTab, TabItem } from '@/redux/slices/tabSlice';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '@/layout/AppWrapper';
import { confirmDialog } from 'primereact/confirmdialog';

export default function TabsComponent() {
    const { theme } = useAppContext();
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

    const confirmDelete = (tabId: any) => {
        confirmDialog({
            className: 'confirm-dialog',
            message: `Do you want to close current tab connection?`,
            header: "Confirmation",
            icon: "pi pi-exclamation-triangle text-red",
            position: 'top',
            accept: () => {
                deleteTab(tabId)
            },
        });
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
                className={`flex align-items-center cursor-pointer border-round p-2 transition-all animation-duration-100`}
                style={{ backgroundColor: tab.tabId == focusedTab ? (theme == 'dark' ? '#1a3635' : 'var(--surface-300)') : 'var(--surface-200)', color: tab.tabId == focusedTab ? (theme == 'dark' ? 'var(--primary-color)' : '') : undefined, width: tab.tabId == focusedTab ? '18vw' : '16vw' }}
                onMouseEnter={() => setHoveredTab(tab.tabId)}
                onMouseLeave={() => setHoveredTab(null)}
                onClick={() => setFocus(tab.tabId)}
            >
                <i
                    className={`pi ${hoveredTab === tab.tabId && index != 0 ? "pi-times" : "pi-plus"} mr-2`}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        // if (index != 0) {
                            confirmDelete(tab.tabId)
                        // }
                    }}
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
