import React, { useContext } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ACTIONS } from '../config/constant';
import { useLayoutContext } from '../layout/LayoutWrapper';
interface RightSidePanel {
    isVisible: boolean,
    title?: any,
    headerTemplate?: any,
    footerTemplate?: any,
    isLoading?: boolean
    action?: any,
    closeIcon: any,
    content: any,
    width?: string,
    onSave?: any
}


const RightSidePanel = ({ title = '', isVisible, action = ACTIONS.VIEW, isLoading = false, headerTemplate, footerTemplate, closeIcon, content, width = '100vw', onSave = () => { } }: RightSidePanel) => {
    const { layoutState } = useLayoutContext()

    const defaultHeaderTemplate = (options: any) => {
        const className = `${options.className} justify-content-space-between`;
        return (
            <div className={className}>
                <div className="flex align-items-center gap-2">
                    <div className="ellipsis-container font-bold" style={{ marginLeft: 10, maxWidth: '40vw' }}>
                        {title}
                    </div>
                </div>
            </div>
        );
    };

    const defaultPanelFooterTemplate = () => {
        return (
            <div className="flex justify-content-end p-2">
                <div>
                    <Button label="Cancel" size="small" severity="secondary" text onClick={closeIcon} />
                    {[ACTIONS.EDIT, ACTIONS.ADD].includes(action) && <Button label="Save" size="small" disabled={isLoading} onClick={onSave} />}
                </div>
            </div>
        );
    };

    return (
        <>
            <Dialog
                visible={isVisible}
                modal={layoutState.isMobile ? true : false}
                header={headerTemplate ? headerTemplate : defaultHeaderTemplate}
                footer={footerTemplate ? footerTemplate : defaultPanelFooterTemplate}
                resizable={false}
                draggable={false}
                position={layoutState.isMobile ? 'center' : 'right'}
                style={{ width: layoutState.isMobile ? '95vw' : width, height: layoutState.isMobile ? '95vh' : '100dvh', maxHeight: '100dvh', margin: 0, borderRadius: 0 }}
                headerStyle={{ borderBottom: '1px solid var(--surface-100)' }}
                onHide={closeIcon}
                className='crud-panel'
            >
                <div className="m-0">
                    {
                        content
                    }
                </div>
            </Dialog>
        </>
    );
};

export default RightSidePanel;
