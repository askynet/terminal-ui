'use client';

import React, { useContext, useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { get } from 'lodash';
import { useAppContext } from '../../../layout/AppWrapper';
import { PostCall } from '../../../api/ApiKit';
import SpinnerButton from '../../../components/SpinnerButton';
import { useLayoutContext } from '../../../layout/LayoutWrapper';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, setPermissions } from '@/redux/slices/authSlice';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { CONFIG, DUMMY_TOKEN } from '../../../config/config';

interface User {
    id: any;
    email: any;
    firstName: any;
    lastName: any;
    token: any
}

const LoginPage = () => {
    const searchParams = useSearchParams();
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
        if (isLoading) {
            return;
        }

        dispatch(login({
            token : DUMMY_TOKEN,
            refreshToken: DUMMY_TOKEN,
            user: {
                userId: 1,
                displayName: 'Akash Ahire',
                firstName: 'Akash'
            }
        }));
        return;

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

    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen  overflow-hidden');
    return (
        <div className={containerClassName}>
            <div className={`flex align-items-center justify-content-center ${layoutState.isMobile ? 'w-full px-4' : 'w-60rem'}`}>
                <div className="surface-0 p-4 shadow-2 border-round w-full" style={{ minWidth: layoutState.isMobile ? 0 : 400 }}>
                    <div className="text-center mb-5">
                        {/* <img src="/next.svg" alt="hyper" height={50} className="mb-3" /> */}
                        <div className="text-900 text-3xl font-medium mb-3">{CONFIG.APP_NAME}</div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-900 font-medium mb-2">
                            Email
                        </label>
                        <InputText id="email" value={email} type="text" placeholder="Email address" className="w-full mb-3" onChange={handleEmail} />

                        <label htmlFor="password" className="block text-900 font-medium mb-2">
                            Password
                        </label>
                        <InputText id="password" value={password} type="password" placeholder="Password" className="w-full mb-3" onChange={handlePassword} />

                        <div className="flex align-items-center justify-content-between mb-4">
                            <div className="flex align-items-center">
                                {/* <Checkbox id="rememberme" onChange={e => setChecked(e.checked)} checked={checked} className="mr-2" />
                                <label htmlFor="rememberme">Remember me</label> */}
                            </div>
                            <Link href="/forgot-password" className="font-medium no-underline ml-2 link-text text-right cursor-pointer">
                                Forgot your password?
                            </Link>
                        </div>

                        <Button
                            label={'Login'}
                            loading={isLoading}
                            className={'w-full'}
                            onClick={loginClick}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
