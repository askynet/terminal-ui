import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { LayoutContextProps, LayoutState } from '../types';
import { useEventListener } from 'primereact/hooks';
import { usePathname, useSearchParams } from 'next/navigation';

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
};
const LayoutContext = createContext(defaultContext);

export const LayoutWrapper = React.memo(({ children }: any) => {
    const [layoutState, setLayoutState] = useState<LayoutState>(defaultContext.layoutState);

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

    const value: LayoutContextProps = {
        layoutState,
        setLayoutState,
        onMenuToggle,
        showSidebar,
        toogleSidebarCollapse,
        toogleSidebarBroken,
        toggleOverlaySidebar
    };

    return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
});

export function useLayoutContext() {
    return useContext(LayoutContext);
}