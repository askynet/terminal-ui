import { Toast } from 'primereact/toast';
import React from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppContextType } from '../types';
import eventEmitter from '../api/event';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { CONFIG } from '../config/config';
import { clearTerminalConfig } from '@/redux/slices/authSlice';

const defaultContext: AppContextType = {
    isLoading: true,
    setLoading: () => { },
    signOut: () => { },
    setAlert: (messgae: string, type?: string) => { },
    isScroll: true,
    setScroll: () => { },
    theme: 'dark',
    setTheme: (theme: any) => { },
};
const AppContext = createContext(defaultContext);

const LIGHT = "/themes/lara-light-green/theme.css";
const DARK = "/themes/lara-dark-green/theme.css";

export const AppWrapper = React.memo(({ children }: any) => {
    const [isLoading, setLoading] = useState(false);
    const [isScroll, setScroll] = useState(false);
    const [theme, setTheme] = useState<any>(localStorage.getItem('pr-theme-mode') || 'dark');

    const toastRef = useRef<any>(null);

    const dispatch = useDispatch<AppDispatch>();
    const { passwordToken } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        localStorage.setItem(CONFIG.AUTH_USER_TOKEN, passwordToken)
    }, [passwordToken])

    useEffect(() => {
        applyTheme(theme === "light" ? LIGHT : DARK);
        localStorage.setItem('pr-theme-mode', theme)
    }, [theme]);

    useEffect(() => {
        const saved = localStorage.getItem("pr-theme-mode");
        if (saved === "dark" || saved === "light") setTheme(saved);

        eventEmitter.on('signOut', (data: any) => {
            signOut();
            setAlert('Session expired')
        });
    }, [])

    const signOut = async (isManual = false) => {
        dispatch(clearTerminalConfig())
    }

    const setAlert = (message: string, type = 'error') => {
        if (toastRef.current) {
            toastRef.current.clear(); // Clear existing toast
        }
        toastRef.current.show({ severity: type, detail: message || (type == 'error' ? 'Failed' : ''), life: 3000 });
    }

    const applyTheme = (href: string) => {
        if (typeof document === "undefined") return;
        let link = document.getElementById("theme-link") as HTMLLinkElement | null;
        let linkRef = document.getElementById("theme-ref") as HTMLLinkElement | null;
        if (!link) {
            link = document.createElement("link");
            link.rel = "stylesheet";
            link.id = "theme-link";
            document.head.appendChild(link);
        }
        if (!linkRef) {
            linkRef = document.createElement("link");
            linkRef.rel = "stylesheet";
            linkRef.id = "theme-ref";
            document.head.appendChild(linkRef);
        }
        link.href = href;
        linkRef.href = `/themes/primeone-${theme}.css`
    };

    return (
        <AppContext.Provider value={{
            isLoading, setLoading,
            signOut,
            setAlert,
            isScroll,
            setScroll,
            theme,
            setTheme
        }}>
            <Toast className='erp-alert' position="top-center" ref={toastRef} style={{ zIndex: 9999999 }} />
            <ConfirmDialog />
            {isLoading && <div className='running-border'></div>}
            <div style={{ overflow: isScroll ? 'auto' : 'hidden', maxHeight: '100dvh' }}>
                {children}
            </div>
        </AppContext.Provider>
    );
})

export function useAppContext() {
    return useContext(AppContext);
}