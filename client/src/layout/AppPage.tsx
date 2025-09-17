
import React, { useContext } from 'react';
import AppHeader from './AppHeader';

interface PageProps {
    title?: string,
    isAppBar?: any,
    isLogo?: any,
    content?: any,
    children?: any,
    containerClass?: string,
    full?: any;
    isScroll?: any,
}

export default function AppPage({ title = '', full = false, isAppBar = true, isLogo = false, isScroll = false, content, containerClass = 'p-4', children = <></> }: PageProps) {
    return <div>
        {
            isAppBar && <AppHeader isLogo={isLogo} title={title} content={content ? content : undefined} />
        }
        <div className={`${isScroll ? 'scroll-box' : ''}`}>
            <div className={full ? containerClass : `container-box ${containerClass}`}>
                {children}
            </div>
        </div>
    </div>
}
