'use client';

import React, { useContext, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { useAppContext } from '../../../layout/AppWrapper';
import { PostCall } from '../../../api/ApiKit';
import SpinnerButton from '../../../components/SpinnerButton';
import { useLayoutContext } from '../../../layout/LayoutWrapper';
import Link from 'next/link';

const ForgotPasswordPage = () => {
    const { isLoading, setAlert, setLoading } = useAppContext();
    const [email, setEmail] = useState('');
    const { layoutState } = useLayoutContext();

    const handleEmail = (event: any) => {
        setEmail(event.target.value);
    };

    const resetPasswordClick = async () => {
        if (isLoading) {
            return;
        }

        if (email) {
            setLoading(true);
            const response: any = await PostCall('/auth/forgot-password', { email });
            setLoading(false);
            if (response.code == 'SUCCESS') {
                setAlert('Password reset email sent successfully!', 'success');
            } else {
                setAlert(response.message);
            }
        } else {
            setAlert('Please enter your email.');
        }
    };

    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen  overflow-hidden');
    return (
        <div className={containerClassName}>
            <div className={`flex align-items-center justify-content-center ${layoutState.isMobile ? 'w-full px-4' : 'w-60rem'}`}>
                <div className="surface-card p-4 shadow-2 border-round w-full" style={{ minWidth: layoutState.isMobile ? 0 : 400 }}>
                    <div className="text-center mb-5">
                        {/* <img src="/images/301io.png" alt="hyper" height={50} className="mb-3" /> */}
                        <div className="text-900 text-3xl font-medium mb-3">Forgot Password</div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-900 font-medium mb-2">Email</label>
                        <InputText
                            id="email"
                            type="text"
                            placeholder="Email address"
                            className="w-full mb-3"
                            value={email}
                            onChange={handleEmail}
                        />

                        <div className="flex align-items-center justify-content-between mb-4">
                            <Link href="/login" className="font-medium no-underline ml-2 link-text text-right cursor-pointer">
                                Back to login?
                            </Link>
                        </div>

                        <Button
                            label={'Send Reset Password Mail'}
                            loading={isLoading}
                            className={'w-full'}
                            onClick={resetPasswordClick}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;

