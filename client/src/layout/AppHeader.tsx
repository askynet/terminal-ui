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
    const { setAlert, signOut } = useAppContext();
    const { toggleOverlaySidebar } = useLayoutContext();
    const { layoutState } = useLayoutContext();

    const { parentTitle, parentPath } = useParentRoute();

    const [visible, setVisible] = useState<boolean>(false);
    const menu = useRef<any>(null);
    const items = [
        {
            template: (item: any, options: any) => {
                return (
                    <div className="p-menuitem cursor-pointer " style={{ alignItems: 'center', padding: 10 }}>
                        <div className='profile-menu-box' style={{ marginLeft: 10 }}>
                            <span style={{ fontWeight: 'bold' }}>{getDisplayName(user)}</span>
                            <br></br>
                            <span style={{ color: 'gray' }}>{get(user, 'email')}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            label: 'Profile',
            icon: 'pi pi-user',
            command: () => showProfile()
        },
        {
            separator: true
        },
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => confirmLogout()
        }
    ];

    const showProfile = () => {
        setVisible(true)
    }

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

    const avatrClick = (e: any) => {
        if (menu) {
            menu.current.toggle(e)
        }
    }

    const onHide = () => setVisible(false)

    const headerTemplate = (<div className='bg-lightgrey p-3'>
        <div className='flex justify-content-between'>
            <div className='flex'>
                <div className='mr-3'>
                    {get(user, 'profle') && <Avatar image={get(user, 'profle')} style={{ width: '4rem', height: '4rem' }} />}
                    {!get(user, 'profle') && <Avatar label={getDisplayName(user)[0]} size="xlarge" style={{ width: '4rem', height: '4rem' }} />}
                </div>
                <div>
                    <p className='m-0'><strong>{getDisplayName(user)}</strong></p>
                    <p>{get(user, 'email', '')}</p>
                    <div className='flex gap-3'>
                        <Button label='Logout' size={'small'} severity={'danger'} outlined onClick={() => confirmLogout()}></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>)

    return (<>
        <header className="crm-header transition-all end-0 position-fixed top-0 overflow-hidden">
            <nav className={`flex justify-content-between align-items-center navbar navbar-expand-xl px-3 ${props.content == undefined ? 'mobile-header-pad' : ''}`} aria-label="navbar" style={{ height: 55 }}>
                {
                    props.content !== undefined && props.content
                }
                {
                    props.content == undefined && <>
                        <div className="dashboard-title flex align-items-center">
                            {
                                ((layoutState.isSidebarBroken && props.isLogo) || props.isLogo) && <>
                                    <Link href={'/'} className='mr-2'>
                                        <img src='/logo.png' style={{ height: '2rem' }} />
                                    </Link>
                                </>
                            }
                            {
                                !layoutState.isSidebar && <>
                                    <Button icon={'pi pi-bars'} className='p-0' text size={'large'} style={{ color: '#fff' }} onClick={() => toggleOverlaySidebar()}></Button>
                                </>
                            }
                            <Link href={parentPath} className="mb-0 text-white font-bold text-lg">{props.title ? props.title : parentTitle}</Link>
                        </div>
                        <div className="flex align-items-center">
                            <div className="header__profile flex align-items-center">
                                <div className="dropdown d-inline-block">
                                    <div className="header__profile--btn dropdowntoggle cursor-pointer flex align-items-center gap-2" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false" onClick={avatrClick} >
                                        <Avatar label={getDisplayName(user)[0]} style={{ backgroundColor: '#9c27b0', color: '#ffffff' }} shape="circle" />
                                    </div>
                                    <Menu model={items} popup ref={menu} style={{ marginTop: 15 }} />
                                </div>
                            </div>
                        </div>
                    </>
                }
            </nav>
        </header>
        <Dialog
            visible={visible}
            header={headerTemplate}
            footer={<></>}
            resizable={false}
            draggable={false}
            closable
            position={'right'}
            style={{ width: '40rem', height: '100dvh', maxHeight: '100dvh', margin: 0, borderRadius: 0 }}
            headerStyle={{ borderBottom: '1px solid lightgrey' }}
            onHide={onHide}
            className='profile-card'
        >
            <div className="m-0">
                <div className='mt-3'>
                    <div className="field">
                        <small>Name</small>
                        <p className='font-bold'>{getDisplayName(user)}</p>
                    </div>
                    <div className="field">
                        <small>Email</small>
                        <p className='font-bold'>{get(user, 'email')}</p>
                    </div>
                </div>
            </div>
        </Dialog>
    </>)
};

AppHeader.displayName = 'AppHeader';

export default AppHeader;