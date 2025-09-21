import React, { useRef } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { LayoutContextProps, LayoutState } from '../types';
import { useEventListener } from 'primereact/hooks';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTokenExpiryAlert } from '../hooks/useTokenExpiryAlert';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { Button } from 'primereact/button';
import axios from 'axios';
import { setAuthRefreshToken, setAuthToken } from '../redux/slices/authSlice';
import { CONFIG } from '../config/config';
import { useAppContext } from './AppWrapper';
import { confirmDialog } from 'primereact/confirmdialog';

const defaultContext: LayoutContextProps = {
    layoutState: {
        theme: 'light',
        isMobile: false,
        isSidebar: true,
        overlayMenuActive: false,
        isSidebarBroken: true
    },
    setLayoutState: () => { },
    onMenuToggle: () => { },
    showSidebar: () => { },
    toogleSidebarCollapse: () => { },
    toggleOverlaySidebar: () => { },
    toogleSidebarBroken: (value: any) => { },
    setTheme: (value: any) => { }
};
const LayoutContext = createContext(defaultContext);

export const LayoutWrapper = React.memo(({ children }: any) => {
    const dialogRef = useRef<any>(null);
    const [layoutState, setLayoutState] = useState<LayoutState>(defaultContext.layoutState);

    const { setAlert, signOut } = useAppContext();

    const dispatch = useDispatch<AppDispatch>();
    const { isLoggedIn, authToken, authRefreshToken, user, permissions } = useSelector((state: RootState) => state.auth);

    const onMenuToggle = () => {
        if (isDesktop()) {
            setLayoutState((prevLayoutState: any) => ({ ...prevLayoutState, overlayMenuActive: !prevLayoutState.overlayMenuActive }));
        } else {
            setLayoutState((prevLayoutState: any) => ({ ...prevLayoutState, overlayMenuActive: !prevLayoutState.overlayMenuActive }));
        }
    };

    const toggleOverlaySidebar = () => {
        setLayoutState((prevLayoutState) => ({ ...prevLayoutState, staticMenuMobileActive: false, overlayMenuActive: !prevLayoutState.overlayMenuActive }));
    };

    const toogleSidebarCollapse = () => {
        setLayoutState((prevLayoutState) => ({ ...prevLayoutState, isSidebarBroken: !prevLayoutState.isSidebarBroken }));
    };

    const toogleSidebarBroken = (value: any) => {
        setLayoutState((prevLayoutState) => ({ ...prevLayoutState, isSidebarBroken: value }));
    };

    const removeMobileMenu = () => {
        document.body.classList.remove("mobile-menu-open");
    }

    const setMobile = (isMobile: boolean) => {
        setLayoutState((prevLayoutState: any) => ({ ...prevLayoutState, overlayMenuActive: false, isMobile: isMobile }));
    };

    const showSidebar = (show: boolean) => {
        setLayoutState((prevLayoutState: any) => ({ ...prevLayoutState, isSidebar: show }));
    };

    const isDesktop = () => {
        return window.innerWidth > 991;
    };

    const setTheme = (theme = 'dark') => {
        return setLayoutState((prevLayoutState: any) => ({ ...prevLayoutState, theme: theme }));
    };

    const [bindMenuOutsideClickListener, unbindMenuOutsideClickListener] = useEventListener({
        type: 'click',
        listener: (event: any) => {
            const isOutsideClicked = event.target.classList.contains("layout-mask");
            if (isOutsideClicked) {
                hideMenu();
            }
        }
    });

    useEffect(() => {
        if (layoutState.overlayMenuActive || layoutState.isSidebarBroken) {
            bindMenuOutsideClickListener();
        }

        layoutState.isSidebarBroken && blockBodyScroll();
    }, [layoutState.overlayMenuActive, layoutState.isSidebarBroken]);

    const pathname = usePathname();
    const searchParams = useSearchParams();
    useEffect(() => {
        hideMenu();
        hideProfileMenu();
    }, [pathname, searchParams]);

    const hideMenu = () => {
        setLayoutState((prevLayoutState: LayoutState) => ({
            ...prevLayoutState,
            overlayMenuActive: false,
            menuHoverActive: false
        }));
        removeMobileMenu();
        unbindMenuOutsideClickListener();
        unblockBodyScroll();
    };

    const hideProfileMenu = () => {
        setLayoutState((prevLayoutState: LayoutState) => ({
            ...prevLayoutState,
            profileSidebarVisible: false
        }));
    };

    const blockBodyScroll = (): void => {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        } else {
            document.body.className += ' blocked-scroll';
        }
    };

    const unblockBodyScroll = (): void => {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        } else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    };

    const handleResize = () => {
        if (isDesktop()) {
            removeMobileMenu();
        }
        const isMobileView = !isDesktop();
        setMobile(isMobileView);
    };

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const hideExpiryDialog = () => {
        if (dialogRef.current) {
            dialogRef.current.hide();
        }
    }

    const refreshAuthToken = async () => {
        try {
            const refreshToken = authRefreshToken;
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            // Make the refresh token request
            const response = await axios.post(`${CONFIG.BASE_URL}/auth/refresh-token`, {
                refreshToken,
            })

            const { data } = response.data;

            if (data.token) {
                dispatch(setAuthToken((data.token)))
            }
            if (data.refreshToken) {
                dispatch(setAuthRefreshToken(data.refreshToken))
            }
        } catch (error: any) {
            setAlert(error.message)
        }
    }

    const footer = (callback: any) => (
        <div className="flex justify-content-end gap-1 mt-1 mb-1">
            <Button label="Logout" icon="pi pi-sign-out" severity="danger" size="small" onClick={() => {
                signOut()
                callback.reject();
            }} />
            <Button label="Refresh" icon="pi pi-refresh" size="small" onClick={() => {
                refreshAuthToken()
                callback.accept();
            }} />
        </div>
    );

    const showTokenExpiryAlert = async (forceLogout?: boolean) => {
        if (forceLogout) {
            console.log('force logout')
            await hideExpiryDialog();
            signOut();
            return;
        }
        if (!isLoggedIn || !user) {
            hideExpiryDialog();
            return;
        }
        dialogRef.current = confirmDialog({
            message: `Your session is about to expire. Click Refresh to stay connected or Logout.`,
            header: "Session Expiring",
            icon: "pi pi-exclamation-triangle text-red",
            position: 'top-right',
            style: { width: '30vw' },
            breakpoints: { '1100px': '30vw', '960px': '100vw' },
            footer: footer
        });
    };
    // 2 min before expiry
    useTokenExpiryAlert(showTokenExpiryAlert, 2 * 60 * 1000);

    // useEffect(() => {
    //     localStorage.setItem('crmColorScheme', layoutState.theme);
    //     const newTheme = layoutState.theme === "dark" ? "lara-dark-indigo" : "lara-light-indigo";
    //     let themeElement = document.getElementById("theme-css");
    //     if (!themeElement) {
    //         themeElement = document.createElement("link");
    //         themeElement.id = "theme-css";
    //         document.head.appendChild(themeElement);
    //     }
    //     themeElement.setAttribute("rel", "stylesheet");
    //     themeElement.setAttribute("data-theme", layoutState.theme);
    //     themeElement.setAttribute("href", `/themes/${newTheme}/theme.css`);
    // }, [layoutState.theme]);

    const value: LayoutContextProps = {
        layoutState,
        setLayoutState,
        onMenuToggle,
        showSidebar,
        toogleSidebarCollapse,
        toogleSidebarBroken,
        toggleOverlaySidebar,
        setTheme
    };

    return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
});

export function useLayoutContext() {
    return useContext(LayoutContext);
}