'use client';

import TerminalWindow from '@/components/Terminal/TerminalWindow';
import AppPage from '@/layout/AppPage';
import { useAppContext } from '@/layout/AppWrapper';
import { useLayoutContext } from '@/layout/LayoutWrapper';
import { RootState } from '@/redux/store';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

const TerminalPage = () => {
    const { isLoading, setLoading, setScroll, setAlert } = useAppContext();
    const { layoutState } = useLayoutContext();

    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        setScroll(false)
        return () => {
            setScroll(true)
        }
    }, [])

    return <AppPage isLogo={true} full={true} containerClass=''>
        <TerminalWindow
            id={uuidv4()}
            isActive={false}
            user={user}
        />
    </AppPage>
}
export default TerminalPage;
