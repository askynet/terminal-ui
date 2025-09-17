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

interface User {
    id: any;
    email: any;
    firstName: any;
    lastName: any;
    token: any
}

const LoginPage = () => {
    const { isLoading, setAlert, setLoading } = useAppContext();
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
            <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
                <div className="flex flex-column align-items-center justify-content-center">
                    <img src="/next.svg" alt="logo" className="mb-5 w-6rem flex-shrink-0" />
                    <div
                        style={{
                            borderRadius: '30px',
                            padding: '0.3rem',
                            background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(247, 149, 48, 0) 30%)'
                        }}
                    >
                        <div className="w-full shadow-2 surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style={{ borderRadius: '28px' }}>
                            <div className="text-center">
                                <div className="text-900 text-3xl font-medium mb-2">Welcome</div>
                                <div className="text-900 text-3xl font-medium mb-2">to</div>
                            </div>
                            <span className="text-center text-900 font-bold text-5xl mb-2">{CONFIG.APP_NAME}</span>
                            <div className="text-center text-600 mb-5">Long app description here to explain</div>
                            <Button label="Sign in" onClick={() => loginClick()} />
                            <div className="text-center text-600 mt-5 mb-2">For any issues, please contact us on</div>
                            <div className="text-center text-600 text-xl font-bold mb-2">support@domain.com</div>
                        </div>
                    </div>
                    <div className='text-center mt-5'>
                        <p>@{moment().format('yyyy')} {CONFIG.APP_NAME}. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
