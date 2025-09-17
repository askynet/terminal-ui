'use client' 

import React, { useContext, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { useAppContext } from '../../../layout/AppWrapper';
import { PostCall } from '../../../api/ApiKit';
import { useLayoutContext } from '../../../layout/LayoutWrapper';
import { useRouter, useSearchParams } from 'next/navigation';

const ResetPasswordPage = () => {
    const searchParams = useSearchParams();
    const resetToken = searchParams.get('resetToken');
    const { isLoading, setAlert, setLoading } = useAppContext();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { layoutState } = useLayoutContext();

    const navigate = useRouter();

    const handleNewPasswordChange = (event: any) => {
        setNewPassword(event.target.value);
    };

    const handleConfirmPasswordChange = (event: any) => {
        setConfirmPassword(event.target.value);
    };

    const updatePasswordClick = async () => {
        if (isLoading) {
            return;
        }

        if (newPassword && confirmPassword) {
            if (newPassword !== confirmPassword) {
                setAlert('Passwords do not match!');
                return;
            }

            setLoading(true);
            const response: any = await PostCall('/auth/reset-password', { newPassword: newPassword, resetToken });
            setLoading(false);

            if (response.code == 'SUCCESS') {
                setAlert('Password updated successfully!', 'success');
                navigate.push('/login'); // Redirect to login page after success
            } else {
                setAlert(response.message);
            }
        } else {
            setAlert('Please fill in both fields.');
        }
    };

    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen  overflow-hidden');
    return (
        <div className={containerClassName}>
            <div className={`flex align-items-center justify-content-center ${layoutState.isMobile ? 'w-full px-4' : 'w-60rem'}`}>
                <div className="surface-card p-4 shadow-2 border-round w-full" style={{ minWidth: layoutState.isMobile ? 0 : 400 }}>
                    <div className="align-items-center mb-4">
                        <div className='flex'>
                            <div>
                                <p className="text-2xl font-medium text-900 mb-0">Hi, We are almost there!</p>
                                <p className='text-md'>Please set new password to your account.</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-900 font-medium mb-2">Passowrd</label>
                        <InputText id="newpassword" type="password" placeholder="New password" className="w-full mb-3" value={newPassword} onChange={handleNewPasswordChange} />


                        <label htmlFor="confirmpassword" className="block text-900 font-medium mb-2">Confirm Password</label>
                        <InputText id="confirmpassword" type="password" placeholder="Confirm password" className="w-full mb-3" value={confirmPassword} onChange={handleConfirmPasswordChange} />


                        <Button
                            label={'Reset password'}
                            loading={isLoading}
                            className={'w-full'}
                            onClick={updatePasswordClick}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;

