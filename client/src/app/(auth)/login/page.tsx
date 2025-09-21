'use client';

import React, { useContext, useEffect, useState } from 'react';
import { useAppContext } from '../../../layout/AppWrapper';
import { PostCall } from '../../../api/ApiKit';
import { useLayoutContext } from '../../../layout/LayoutWrapper';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, setPermissions } from '@/redux/slices/authSlice';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { CONFIG, DUMMY_TOKEN } from '../../../config/config';
import moment from 'moment-timezone';
import { InputText } from 'primereact/inputtext';

interface User {
    id: any;
    email: any;
    firstName: any;
    lastName: any;
    token: any
}

const LoginPage = () => {
    const { isLoading, setAlert, setLoading, theme, setTheme } = useAppContext();
    const [email, setEmail] = useState('exuud@admin.com');
    const [password, setPassword] = useState('exuud123');
    const { layoutState } = useLayoutContext();

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useRouter();

    const handleEmail = (event: any) => {
        setEmail(event.target.value);
    };

    const handlePassword = (event: any) => {
        setPassword(event.target.value);
    };

    const loginClick = async () => {
        console.log('login click')
        dispatch(login({
            token: DUMMY_TOKEN,
            refreshToken: DUMMY_TOKEN,
            user: {
                userId: 1,
                displayName: 'Akash Ahire',
                firstName: 'Akash'
            }
        }));
        return;

        if (isLoading) {
            return;
        }

        if (email && password) {
            setLoading(true);
            const resoponse: any = await PostCall('/auth/sign-in', { email, password });
            setLoading(false);
            if (resoponse.code == 'SUCCESS') {
                setAlert('Login success!!', 'success');
                dispatch(login(resoponse.data));
                if (resoponse.permissions) {
                    dispatch(setPermissions(resoponse.permissions))
                }
            } else if (resoponse.code == 'RESET_PASSWORD') {
                setAlert('Please reset you password');
                navigate.push(`/reset-password?resetToken=${resoponse.resetToken}`);
            } else {
                setAlert(resoponse.message);
            }
        }
    };

    return (
        <div>
            <div className='fixed mt-2 right-0 mr-2'>
                <span onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex flex-shrink-0 cursor-pointer px-link border-1 border-round w-2rem h-2rem align-items-center justify-content-center transition-all transition-duration-300 hover:border-primary" style={{ borderColor: 'var(--menu-border-color)'}}>
                    <i className={`pi ${theme === 'dark' ? 'pi-sun' : 'pi-moon'} text-100`} />
                </span>
            </div>
            <div className="flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
                <div className="flex flex-column align-items-center justify-content-center">
                    <img src="/next.svg" alt="logo" className="mb-5 w-6rem flex-shrink-0 text-color" />
                    <div className='w-25rem'>
                        <label>Username</label>
                        <InputText className='w-full mb-3 mt-2' placeholder='LanId' />
                    </div>
                    <div className='w-25rem'>
                        <label>Password</label>
                        <InputText className='w-full mb-3 mt-2' placeholder='Password' />
                    </div>
                    <Button className='w-full mt-2' label="Sign in" onClick={() => loginClick()} />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
