'use client';

import React, { useState } from 'react';
import { useAppContext } from '../../../layout/AppWrapper';
import { PostCall } from '../../../api/ApiKit';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../redux/store';
import { setTerminalConfig } from '@/redux/slices/authSlice';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { CustomResponse } from '@/types';

const LoginPage = () => {
    const { isLoading, setAlert, setLoading, theme, setTheme } = useAppContext();
    const [lanId, setLanId] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch<AppDispatch>();

    const handleLanId = (event: any) => {
        setLanId(event.target.value);
    };

    const handlePassword = (event: any) => {
        setPassword(event.target.value);
    };

    const loginClick = async () => {
        if (isLoading) {
            return;
        }
        if (!lanId || !password) {
            return
        }
        setLoading(true)
        const response: CustomResponse = await PostCall(`/generate-ssh-token`, {
            lanId: lanId,
            password: password
        })
        setLoading(false);
        if (response.code === 'SUCCESS') {
            dispatch(setTerminalConfig(response.data))
        }
        else {
            setAlert(response.message)
        }
    };

    return (
        <div>
            <div className='fixed mt-2 right-0 mr-2'>
                <span onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex flex-shrink-0 cursor-pointer px-link border-1 border-round w-2rem h-2rem align-items-center justify-content-center transition-all transition-duration-300 hover:border-primary" style={{ borderColor: 'var(--surface-100)' }}>
                    <i className={`pi ${theme === 'dark' ? 'pi-sun' : 'pi-moon'} text-100`} />
                </span>
            </div>
            <div className="flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
                <div className="flex flex-column align-items-center justify-content-center">
                    <img src="/logo2.png" alt="logo" className="mb-5 w-6rem flex-shrink-0 text-color" />
                    <div className='w-25rem'>
                        <label>Username</label>
                        <InputText className='w-full mb-3 mt-2' placeholder='LanId' onChange={handleLanId} />
                    </div>
                    <div className='w-25rem'>
                        <label>Password</label>
                        <InputText className='w-full mb-3 mt-2' type='password' placeholder='Password' onChange={handlePassword} />
                    </div>
                    <Button loading={isLoading} className='w-full mt-2' label="Sign in" onClick={() => loginClick()} disabled={!lanId || !password}/>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;