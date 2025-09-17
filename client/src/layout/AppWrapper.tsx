import { Toast } from 'primereact/toast';
import React from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppContextType } from '../types';
import eventEmitter from '../api/event';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { logout, setAuthToken } from '../redux/slices/authSlice';
import { CONFIG } from '../config/config';

const defaultContext: AppContextType = {
    isLoading: true,
    setLoading: () => { },
    signOut: () => { },
    setAlert: (messgae: string, type?: string) => { },
    isScroll: true,
    setScroll: () => { },
    permissions: []
};
const AppContext = createContext(defaultContext);

export const AppWrapper = React.memo(({ children }: any) => {
    const [isLoading, setLoading] = useState(false);
    const [isScroll, setScroll] = useState(false);

    const toastRef = useRef<any>(null);

    const dispatch = useDispatch<AppDispatch>();
    const { isLoggedIn, authToken, authRefreshToken, user, permissions } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        localStorage.setItem(CONFIG.AUTH_USER_TOKEN, authToken)
    }, [authToken])

    useEffect(() => {
        localStorage.setItem(CONFIG.AUTH_USER_REFRESH_TOKEN, authRefreshToken)
    }, [authRefreshToken])

    useEffect(() => {
        eventEmitter.on('signOut', (data: any) => {
            signOut();
            setAlert('Session expired')
        });
        eventEmitter.on('token', (data: any) => {
            if (authToken != data) {
                dispatch(setAuthToken(data))
            }
        });
    }, [])

    const signOut = async (isManual = false) => {
        dispatch(logout())
    }

    const setAlert = (message: string, type = 'error') => {
        if (toastRef.current) {
            toastRef.current.clear(); // Clear existing toast
        }
        toastRef.current.show({ severity: type, detail: message || (type == 'error' ? 'Failed' : ''), life: 3000 });
    }

    return (
        <AppContext.Provider value={{
            isLoading, setLoading,
            signOut,
            setAlert,
            isScroll,
            setScroll,
            permissions
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