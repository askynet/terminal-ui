import React, { useRef, useState } from 'react';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { confirmDialog } from 'primereact/confirmdialog';
import { useAppContext } from './AppWrapper';
import { get } from 'lodash';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useLayoutContext } from './LayoutWrapper';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getDisplayName } from '../utils/utils';
import Link from 'next/link';
import { TabPanel, TabView } from 'primereact/tabview';
import { InputText } from 'primereact/inputtext';
import TabsComponent from '@/components/TabsComponent';

interface AppHeaderProps {
    title?: any,
    content?: any
    isLogo?: boolean
}

const useParentRoute = () => {
    const pathname = usePathname();
    const getParentPath = (path: any) => {
        const segments = path.split('/').filter(Boolean);
        if (segments.length <= 1) return `/${segments[0] || ''}`;
        return `${segments[0]}`;
    };
    const parentPath = getParentPath(pathname).replace(/\//, '');
    const parentTitle = parentPath.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return {
        parentTitle,
        parentPath: `/${parentPath}`
    };
};

const AppHeader = (props: AppHeaderProps) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const { setAlert, signOut, theme, setTheme } = useAppContext();
    const { layoutState } = useLayoutContext();

    const confirmLogout = () => {
        confirmDialog({
            className: 'confirm-dialog',
            message: `Do you really want to logout?`,
            header: "Confirmation",
            icon: "pi pi-exclamation-triangle text-red",
            position: 'top',
            accept: () => {
                accept()
            },
        });
    }

    const accept = () => {
        signOut(true);
    }

    return (<>
        <header className="border-bottom-1 transition-all end-0 position-fixed top-0 overflow-hidden" style={{ borderColor: "var(--surface-border)" }}>
            <nav className={`flex justify-content-between align-items-center navbar navbar-expand-xl px-3`} aria-label="navbar" style={{ height: 45 }}>
                <div className="dashboard-title flex align-items-center">
                    {
                        ((layoutState.isSidebarBroken && props.isLogo) || props.isLogo) && <>
                            <Link href={'/'} className='flex align-items-center gap-2 mr-2'>
                                <img src='/logo2.png' style={{ height: '2rem' }} /> |
                            </Link>
                        </>
                    }
                    <TabsComponent />
                </div>
                <ul className="flex list-none m-0 p-0 gap-2 align-items-center">
                    <li>
                        <span onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex flex-shrink-0 cursor-pointer px-link border-1 border-solid w-2rem h-2rem border-round  align-items-center justify-content-center transition-all transition-duration-300 hover:border-primary" style={{ borderColor: 'var(--surface-100)' }}>
                            <i className={`pi ${theme === 'dark' ? 'pi-sun' : 'pi-moon'} text-100`} />
                        </span>
                    </li>
                    <li>
                        <span
                            onClick={() => confirmLogout()}
                            className="flex flex-shrink-0 cursor-pointer px-link border-1 border-solid w-2rem h-2rem border-round  align-items-center justify-content-center transition-all transition-duration-300 hover:border-primary"
                            style={{ borderColor: 'var(--surface-100)' }}
                        >
                            <i className="pi pi-sign-out text-100" />
                        </span>
                    </li>
                </ul>
            </nav>
        </header>
    </>)
};

AppHeader.displayName = 'AppHeader';

export default AppHeader;