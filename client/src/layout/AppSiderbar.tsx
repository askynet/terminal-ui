import { Sidebar, Menu, SubMenu, MenuItem, menuClasses, MenuItemStyles } from 'react-pro-sidebar';
import { AppMenuItem } from '../types';
import { get, intersection } from 'lodash';
import { classNames } from 'primereact/utils';
import { useLayoutContext } from './LayoutWrapper';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import Link from 'next/link';
import { addTab, focusTab } from '../redux/slices/tabSlice';
import moment from 'moment-timezone';
import { v4 as uuidv4 } from "uuid";

const themes = {
    light: {
        sidebar: {
            backgroundColor: '#ffffff',
            color: '#030712',
        },
        menu: {
            menuContent: '#fbfcfd',
            color: '#8e8eaa',
            icon: '#8e8eaa',
            hover: {
                backgroundColor: '#f6f6fa',
                color: 'var(--primary-color)',
                icon: 'var(--primary-color)',
            },
            disabled: {
                color: '#9fb6cf',
            },
        },
    },
    dark: {
        sidebar: {
            backgroundColor: '#212135',
            color: '#a6b0cf',
        },
        menu: {
            menuContent: '#212135',
            icon: '#a6b0cf',
            color: '#a6b0cf',
            hover: {
                backgroundColor: '#212135',
                color: 'var(--primary-color)',
                icon: 'var(--primary-color)',
            },
            disabled: {
                color: '#3e5e7e',
            },
        },
    },
}

const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};


const AppSidebar = () => {
    const navigate = useRouter();
    const { layoutState, showSidebar, toogleSidebarBroken, onMenuToggle } = useLayoutContext();
    const location = usePathname();
    const currentPath = location;

    const dispatch = useDispatch<AppDispatch>();
    const { user, permissions } = useSelector((state: RootState) => state.auth);
    const { focusedTab, tabs } = useSelector((state: RootState) => state.tabs);

    const itemClick = (item: any, originalEvent: any) => {
        if (item.command) {
            item.command();
        }
        else if (item.url) {
            navigate.push(item.url);
            dispatch(focusTab(0))
        }
    }

    const theme = layoutState.theme as keyof typeof themes;
    const menuItemStyles: MenuItemStyles = {
        root: {
            fontSize: '14px',
            fontWeight: 600,
        },
        icon: ({ open, active }) => ({
            marginRight: 0,
            padding: 10,
            fontSize: 20,
            color: themes[theme].menu.icon,
            '&:hover': {
                color: themes[theme].menu.hover.color,
                borderRadius: 5,
                backgroundColor: themes[theme].menu.hover.backgroundColor,
            },
            '&:active': {
                color: themes[theme].menu.hover.color,
                borderRadius: 5,
                backgroundColor: themes[theme].menu.hover.backgroundColor,
            }
        }),
        SubMenuExpandIcon: {
            color: themes[theme].menu.icon,
            '&:hover': {
                color: themes[theme].menu.hover.icon,
            },
            '&:active': {
                color: themes[theme].menu.hover.icon,
            }
        },
        subMenuContent: ({ level }) => ({
            backgroundColor:
                level === 0
                    ? hexToRgba(themes[theme].menu.menuContent, 1)
                    : 'transparent',
            '&:active': {
                color: themes[theme].menu.hover.icon,
            }
        }),
        button: ({ level }) => ({
            paddingLeft: level === 0 ? 10 : undefined,
            '&:hover': {
                backgroundColor: 'unset',
                color: themes[theme].menu.hover.color,
            },
            '&.active': {
                backgroundColor: 'unset',
                color: themes[theme].menu.hover.color,
            }
        }),
        label: ({ open, active }) => ({
            fontWeight: open ? 600 : undefined,
            color: active ? themes[theme].menu.hover.color : themes[theme].menu.color,
            '&:hover': {
                color: themes[theme].menu.hover.color,
            },
            '&.active': {
                color: themes[theme].menu.hover.color,
            }
        })
    };

    const menuArr: AppMenuItem[] = [
        {
            label: 'Dashboard',
            icon: 'pi pi-home',
            url: '/'
        },
        {
            label: 'Order Booklet',
            icon: 'pi pi-desktop',
            command: () => {
                window.open('/terminal', '_blank', 'noopener,noreferrer');
            }
        },
        {
            label: 'Workspace',
            icon: 'pi pi-desktop',
            url: '/workspace'
        },
        {
            label: 'Users',
            icon: 'pi pi-users',
            url: '/users',
            check: (user: any) => {
                return true;
                const checkComm = intersection([], permissions);
                if (get(user, 'isSuperAdmin') || checkComm.length > 0) {
                    return true;
                }
                return false;
            },
        }
    ];

    const isActive = (item: AppMenuItem) => {
        let isActive = false
        if (item.url === currentPath) {
            isActive = true
        }
        else if (item.items) {
            isActive = item.items.some((subItem) => subItem.url === currentPath)
        }
        return isActive;
    }

    const iconClass = classNames('sidebar-toogler pi', {
        'pi-angle-left text-lg p-3 text-xl': !layoutState.isSidebarBroken,
        'pi-angle-right text-lg p-3 text-xl': layoutState.isSidebarBroken
    });

    return (
        <div className={`sidebar sidebar-theme-${theme}`}>
            <Sidebar
                collapsed={layoutState.isSidebarBroken}
                toggled={layoutState.overlayMenuActive}
                onBackdropClick={() => onMenuToggle()}
                onBreakPoint={(value) => showSidebar(!value)}
                backgroundColor={hexToRgba(themes[theme].sidebar.backgroundColor, 1)}
                breakPoint="md"
                rootStyles={{
                    color: themes[theme].sidebar.color,
                    border: 'none',
                }}
                collapsedWidth={'55px'}
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className='sidebar-logo flex border-bottom-1 border-light'>
                        <Link href={'/'} className="flex align-items-center justify-content-center layout-topbar-logo w-full">
                            <img src="/next.svg" width="90%" height={'30px'} alt="logo" className={'logo'} />
                        </Link>
                    </div>
                    <div style={{ flex: 1, marginBottom: '32px', marginTop: 10 }}>
                        <Menu menuItemStyles={menuItemStyles} closeOnClick={true}>
                            {menuArr.map((item, i) => {
                                if (!item) return null;

                                if (item.check && !item.check(user)) {
                                    return null;
                                }

                                if (item.items && item.items.length > 0) {
                                    return <SubMenu
                                        key={`SubMenu${i}${item.label}`}
                                        label={item.label}
                                        title={item.label}
                                        active={isActive(item)}
                                        className={`${layoutState.isSidebarBroken ? 'only-icon-menu' : ''}`}
                                        icon={<i className={`${item.icon} ${layoutState.isSidebarBroken ? 'only-icon' : ''}`}></i>}
                                    >
                                        {
                                            item.items.map((subMenu: AppMenuItem, subIndex: any) => {
                                                return <MenuItem key={`SubMenu${i}${item.label}${subIndex}`} title={subMenu.label} active={isActive(subMenu)} onClick={(event) => itemClick(subMenu, event)}>{subMenu.label}</MenuItem>
                                            })
                                        }
                                    </SubMenu>
                                }
                                else {
                                    return <MenuItem
                                        key={`MenuItem${i}`}
                                        title={item.label}
                                        className={`${layoutState.isSidebarBroken ? 'only-icon-menu' : ''}`}
                                        icon={<i className={`${item.icon} ${layoutState.isSidebarBroken ? 'only-icon' : ''}`}></i>}
                                        active={isActive(item)}
                                        onClick={(event) => itemClick(item, event)}
                                    >{item.label}</MenuItem>
                                }
                            })}
                        </Menu>
                    </div>
                    {layoutState.isSidebar && (
                        <div className='flex border-top-1 border-light fixed bottom-0' style={{ width: layoutState.isSidebarBroken ? 55 : 250, transition: 'width 0.1s ease-in-out' }}>
                            <div className="flex align-items-center justify-content-center w-full cursor-pointer" onClick={() => toogleSidebarBroken(!layoutState.isSidebarBroken)}>
                                <i className={iconClass}></i>
                            </div>
                        </div>
                    )}
                </div>
            </Sidebar>
        </div>
    );
};


export default AppSidebar;
