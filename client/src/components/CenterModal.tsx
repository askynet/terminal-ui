import { Dialog } from "primereact/dialog"
import { IconField } from "primereact/iconfield"
import { Button } from "primereact/button"
import { useLayoutContext } from "../layout/LayoutWrapper";

interface CenterModalProps {
    isVisible: boolean,
    icon?: any;
    content: any,
    onClose: any,
    title?: any,
    onSave?: any,
    saveText?: string,
    width?: string,
    height?: string,
    header?: any
}

const CenterModal = ({ isVisible, icon = 'pi pi-table', title = '', saveText = 'Save', width = '40vw', content, onClose, onSave, header }: CenterModalProps) => {
    const { layoutState } = useLayoutContext();

    return <>
        <Dialog
            visible={isVisible}
            position="top"
            onHide={onClose}
            header={null}
            style={{ width: layoutState.isMobile ? '96vw' : width }}
            content={<div className="bg-white" style={{ borderRadius: '12px' }}>
                <div className="flex align-items-center justify-content-between mb-2 py-2 px-4 border-bottom-1 border-light">
                    {
                        header ? header : <span className="flex align-items-center">
                            <IconField className={`${icon} text-lg mr-2`}></IconField>
                            <p className="text-lg font-bold">{title}</p>
                        </span>
                    }
                    <span className="p-2 border-circle hover-hover-bg" onClick={onClose}>
                        <IconField className="pi pi-times cursor-pointer" />
                    </span>
                </div>
                <div className="p-fluid py-2 px-4 mb-3" style={{ minHeight: 50, maxHeight: '75vh', overflow: 'auto' }}>
                    {content}
                </div>
                {
                    onSave && <div className="flex align-items-center justify-content-end mt-3 py-2 px-3 border-top-1 border-light">
                        <div className="flex gap-2">
                            <Button outlined label="Cancel" size="small" severity="secondary" onClick={onClose} />
                            <Button label={saveText} size="small" onClick={onSave} />
                        </div>
                    </div>
                }
            </div>}
        />
    </>
}

export default CenterModal;