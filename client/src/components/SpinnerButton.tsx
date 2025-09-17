import React, { useState } from 'react';
import { Button } from 'primereact/button';

interface OptionProps {
    isLoading: boolean;
    label?: any;
    icon?: any;
    className?: any;
    style?: any;
    onClick: () => void
}

const SpinnerButton = ({ isLoading = false, label = '', icon = '', className = '', style = {}, onClick = () => { } }: OptionProps) => {
    return (
        <div className={`btn-tymmo-primary spinner-button bg-primary px-4 py-1 box-shadow border-round flex justify-content-center align-items-center cursor-pointer text-white select-none ${className} ${isLoading ? 'link-disabled' : ''}`} style={{ minWidth: 100 }} onClick={() => !isLoading && onClick()}>
            {isLoading ? <span><i className='pi pi-spin pi-spinner font-bold text-white'></i></span> : <></>}
            {!isLoading ? <span className='font-bold'>{label}</span> : ''}
        </div>
    )
};

export default SpinnerButton;
