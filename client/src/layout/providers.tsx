'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { PrimeReactProvider } from 'primereact/api';
import { persistor, store } from '../redux/store';
import { AppWrapper } from './AppWrapper';
import ProtectedRoute from './ProtectedRoute';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrimeReactProvider>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <AppWrapper>
                        <ProtectedRoute>
                            {children}
                        </ProtectedRoute>
                    </AppWrapper>
                </PersistGate>
            </Provider>
        </PrimeReactProvider>
    );
}
