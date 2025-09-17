
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable, DataTableBaseProps, DataTableValueArray } from 'primereact/datatable';
import { Column, ColumnProps } from 'primereact/column';
import { confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { debounce, omit } from 'lodash';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { makeSlug } from '../utils/utils';

interface ColumnItem extends ColumnProps {
    dbField?: string
}

interface ExtraButton {
    label?: any,
    icon?: any,
    onClick?: (item: any, event?: any) => void
}

const omittedProps = ['isArchiveView', 'onAdd', 'onEdit', 'onDelete', 'addPermission', 'updatePermission', 'deletePermission'];

interface CustomLocalTableOption extends DataTableBaseProps<DataTableValueArray> {
    title?: string,
    searchkey?: any;
    data: any[],
    limit: number,
    page: number,
    columns: ColumnItem[],
    tree?: boolean,
    filter?: any,
    include?: string[],
    isAdd?: boolean;
    isEdit?: boolean,
    isDelete?: boolean,
    isView?: boolean,
    headerButtons?: ExtraButton[],
    extraButtons?: ExtraButton[],
    defaultSort?: string;
    onLoad?: (item: any) => void,
    onAdd?: () => void;
    onView?: (item: any) => void,
    onEdit?: (item: any) => void,
    onDelete?: (item: any) => void,
    isArchiveView?: any;
    addPermission?: any;
    updatePermission?: any;
    deletePermission?: any;
}

export interface CustomLocalTableRef {
    refreshData: () => any,
    getCurrentPagerState: () => any,
    updatePagination: (page: any) => any,
    updatePaginationAfterDelete: (key: string, rowId: any) => void;
}

const CustomLocalTable = forwardRef<CustomLocalTableRef, CustomLocalTableOption>((props: CustomLocalTableOption, ref?: any) => {
    const { user, permissions } = useSelector((state: RootState) => state.auth);
    const { isView, isEdit, isDelete, headerButtons, extraButtons, defaultSort, onLoad, onView, onEdit, onDelete, ...restProps } = props;
    const [lazyParams, setLazyParams] = useState<any>({
        first: 0,
        rows: 10,
        page: 1,
        search: '',
        sortField: undefined,
        sortOrder: undefined,
        filters: {}
    });

    const [search, setSearch] = useState('');
    const [tableHeight, setTableHeight] = useState('30rem');
    const [archive, setArchive] = useState(false);

    useImperativeHandle(ref, () => ({
        getCurrentPagerState: () => {
            return lazyParams
        },
        refreshData: () => {
            setLazyParams({ ...lazyParams })
        },
        updatePagination: (page: number) => {
            setLazyParams({
                ...lazyParams,
                page: page,
                first: page * props.limit,
            })
        },
        updatePaginationAfterDelete: (key: string, rowId: number) => {
            const updatedData = props.data.filter((item) => item[key] !== rowId);
            if (updatedData.length === 0 && props.page > 0) {
                setLazyParams({
                    ...lazyParams,
                    page: props.page - 1,
                    first: (props.page - 1) * props.limit,
                })
            } else {
                setLazyParams({ ...lazyParams })
            }
        }
    }));

    const canAccess = (permission: any) => {
        return user?.isSuperAdmin || permissions.includes(permission);
    };

    const calculateTableHeight = () => {
        const headerHeight = 250;
        const availableHeight = window.innerHeight - headerHeight - (props.header ? 50 : 0);
        setTableHeight(`${availableHeight}px`);
    };

    useEffect(() => {
        calculateTableHeight();
        window.addEventListener('resize', calculateTableHeight);
        return () => {
            window.removeEventListener('resize', calculateTableHeight);
        };
    }, []);

    const debounceUpdate = useCallback(
        debounce((newSearch) => {
            setLazyParams((prevParams: any) => ({ ...prevParams, search: newSearch }));
        }, 50),
        []
    );

    useEffect(() => {
        debounceUpdate(search);
        return debounceUpdate.cancel;
    }, [search, debounceUpdate]);


    const confirmDelete = (item?: any) => {
        confirmDialog({
            className: 'confirm-dialog',
            message: `Do you really want to delete this?`,
            header: "Confirmation",
            icon: "pi pi-exclamation-triangle text-red",
            position: 'top',
            accept: () => {
                if (props.onDelete) {
                    props.onDelete(item)
                }
            },
        });
    }

    const renderActions = (item: any) => {
        return (
            <div className='flex'>
                {
                    props?.extraButtons && props?.extraButtons?.length > 0 && props.extraButtons.map((btn: ExtraButton, index: any) => <Button severity={'secondary'} key={`ExtraButton${index}`} type="button" icon={btn.icon} className="p-button-sm p-button-text" onClick={(event: any) => btn.onClick && btn.onClick(item, event)} />)
                }
                {
                    props.onView && <Button type="button" icon={'pi pi-eye s-color'} className="p-button-sm p-button-text" onClick={() => props.onView && props.onView(item)} />
                }
                {
                    props.onEdit && canAccess(props.updatePermission) && <Button type="button" icon={'pi pi-pencil'} className="p-button-sm p-button-text p-button-warning" onClick={() => props.onEdit && props.onEdit(item)} />
                }
                {
                    props.onDelete && canAccess(props.deletePermission) && (item && !item.isDefault) && <Button type="button" icon={'pi pi-trash'} className="p-button-sm p-button-text p-button-danger" style={{ color: 'red' }} onClick={() => confirmDelete(item)} />
                }
            </div>
        )
    }

    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2 mx-3">
            <div>
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search"> </InputIcon>
                    <InputText placeholder="Search" className='w-30rem' onChange={(e) => setSearch(e.target.value)} />
                </IconField>
            </div>
            <div>
                {
                    props.onAdd && archive == false && canAccess(props.addPermission) ? <Button size='small' label='Add' icon="pi pi-plus" onClick={() => props.onAdd && props.onAdd()} ></Button> : <></>
                }
                {
                    props.headerButtons && props.headerButtons.map((btn: ExtraButton, index: number) => (<Button className='s-bg s-br' size='small' key={makeSlug(btn.label + btn.icon + index)} icon={btn.icon ? btn.icon : ''} label={btn.label} onClick={btn.onClick}></Button>))
                }
            </div>
        </div>
    );

    const filteredData = search.length > 0 ? props.data.filter((item: any) => item.name.toLowerCase().includes(search.toLowerCase())) : props.data;

    return (
        <div className={`card erp-table-container ${props.className || ''}`}>
            <DataTable
                header={props.header ? props.header : header}
                paginator={props.paginator ? props.paginator : true}
                scrollable
                removableSort
                {...omit(restProps, omittedProps)}
                totalRecords={filteredData.length}
                rows={props.limit}
                value={filteredData}
                filterDisplay={props.filter ? 'row' : undefined}
                className='erp-table'
                pageLinkSize={3}
                scrollHeight={tableHeight}
                tableStyle={{ minWidth: '30rem' }}
                paginatorTemplate={'CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink'}
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
                {
                    props.columns.map((item: ColumnProps, index: any) => <Column key={index} {...item}></Column>)
                }
                {
                    (props.onEdit || props.onView || props.onDelete || props.extraButtons?.length) && <Column style={{ width: 100 }} alignFrozen="right" frozen body={renderActions} ></Column>
                }
            </DataTable>
        </div>
    )
});

export default CustomLocalTable;

