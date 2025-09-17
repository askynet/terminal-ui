
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable, DataTableBaseProps, DataTableFilterEvent, DataTablePageEvent, DataTableValueArray } from 'primereact/datatable';
import { Column, ColumnFilterElementTemplateOptions, ColumnProps } from 'primereact/column';
import { confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { debounce, isEqual, omit } from 'lodash';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { makeSlug } from '../utils/utils';

interface ColumnItem extends ColumnProps {
    dbField?: string,
    fiterType?: string,
    filterOptions?: any[],
    filterOptionLable?: any,
    filterOptionValue?: any,
    filterItemTemplate?: any;
    filterValueTemplate?: any
}

interface ExtraButton {
    label?: any,
    icon?: any,
    onClick?: (item: any, event?: any) => void
}

const omittedProps = ['isArchiveView', 'onAdd', 'onEdit', 'onDelete', 'addPermission', 'updatePermission', 'deletePermission'];

interface CustomTableOption extends DataTableBaseProps<DataTableValueArray> {
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

export interface CustomDataTableRef {
    refreshData: () => any,
    getCurrentPagerState: () => any,
    updatePagination: (page: any) => any,
    updatePaginationAfterDelete: (key: string, rowId: any) => void;
}

const CustomDataTable = forwardRef<CustomDataTableRef, CustomTableOption>((props: CustomTableOption, ref?: any) => {
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

    const prevLazyLoadRef: any = useRef(null);
    useEffect(() => {
        if (prevLazyLoadRef.current !== null && !isEqual(lazyParams, prevLazyLoadRef.current)) {
            loadDataFromServer();
        }
        prevLazyLoadRef.current = JSON.parse(JSON.stringify(lazyParams));
    }, [lazyParams]);

    const prevArchiveRef: any = useRef(null);
    useEffect(() => {
        if (prevArchiveRef.current !== null && prevArchiveRef.current != archive) {
            loadDataFromServer();
        }
        prevArchiveRef.current = archive;
    }, [archive]);

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

    const loadDataFromServer = async () => {
        const params = {
            page: lazyParams.page || 1,
            limit: props.limit,
            sortBy: lazyParams.sortField,
            search: search,
            sortOrder: lazyParams.sortOrder === 1 ? 'asc' : 'desc',
            filters: convertFiltersToQueryParams(lazyParams.filters),
            include: props.include || []
        };
        if (lazyParams.sortOrder === undefined) {
            params.sortOrder = props.defaultSort ? props.defaultSort : 'desc';
        }

        if (archive) {
            params.filters['archive'] = 'true';
        }
        if (props.onLoad) {
            props.onLoad(params)
        }
    }

    const convertFiltersToQueryParams = (filters: any) => {
        const filterParams: any = {};
        if (filters) {
            Object.keys(filters).forEach((filterField) => {
                filterParams[filterField] = filters[filterField].value || '';
            });
        }
        return filterParams;
    };

    const headerTemplate = (options: any) => {
        return <div></div>
    }

    const onPage = (event: DataTablePageEvent) => {
        setLazyParams({
            ...lazyParams,
            first: event.first,
            rows: event.rows,
            page: event.page ? event.page + 1 : 1
        });
    };

    const onFilter = (event: DataTableFilterEvent) => {
        setLazyParams({
            ...event,
            first: 0
        });
    }

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
                    props.onEdit && item?.deletedAt == null && canAccess(props.updatePermission) && <Button type="button" icon={'pi pi-pencil'} className="p-button-sm p-button-text p-button-warning" onClick={() => props.onEdit && props.onEdit(item)} />
                }
                {
                    props.onDelete && item?.deletedAt == null && canAccess(props.deletePermission) && (item && !item.isDefault) && <Button type="button" icon={'pi pi-trash'} className="p-button-sm p-button-text p-button-danger" style={{ color: 'red' }} onClick={() => confirmDelete(item)} />
                }
            </div>
        )
    }

    const getCurrentParams = () => {
        return lazyParams
    };

    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2 mx-3">
            <div className='flex align-items-center gap-2'>
                <p className='m-0'>{props.title}</p>
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

    const filterTemplate = (column: ColumnItem, options: ColumnFilterElementTemplateOptions) => {
        if (!column.filter) return null;

        return column.filterType === 'dropdown' ? (
            <Dropdown
                value={options.value}
                options={column.filterOptions || []}
                optionLabel={column?.filterOptionLable || null}
                optionValue={column?.filterOptionValue || null}
                onChange={(e) => options.filterApplyCallback(e.value)}
                placeholder={column.filterPlaceholder || `Select ${column.header}`}
                className="p-column-filter"
                showClear
                style={{ width: '100%', minWidth: '8rem' }}
                itemTemplate={column.filterItemTemplate || null}
                valueTemplate={column.filterValueTemplate || null}
                filter
            />
        ) : <InputText value={options.value || ''} onChange={(e) => options.filterApplyCallback(e.target.value)} placeholder={column.filterPlaceholder || `Search ${column.header}`} className="p-column-filter" style={{ width: '100%' }} />
    };

    return (
        <div className='card erp-table-container'>
            <DataTable
                lazy
                header={props.header ? props.header : header}
                paginator
                scrollable
                removableSort
                {...omit(restProps, omittedProps)}
                totalRecords={props.totalRecords || 0}
                first={lazyParams.first}
                rows={props.limit}
                value={props.data}
                filterDisplay={props.filter ? 'row' : undefined}
                className='erp-table'
                pageLinkSize={3}
                scrollHeight={tableHeight}
                onPage={onPage}
                onFilter={onFilter}
                onSort={onFilter}
                sortField={lazyParams.sortField}
                sortOrder={lazyParams.sortOrder}
                tableStyle={{ minWidth: '30rem' }}
                paginatorLeft={props.isArchiveView ? <div className="flex align-items-center ml-3">
                    <InputSwitch inputId="showArchiveId" checked={archive} onChange={(e) => setArchive(e.value)} style={{ transform: 'scale(0.7)' }} />
                    <label htmlFor="showArchiveId" className="ml-1 cursor-pointer">Show Archive</label>
                </div> : <></>}
                paginatorRight={<></>}
                paginatorTemplate={'CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink'}
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}">
                {
                    props.columns.map((item: ColumnProps, index: any) => <Column key={index} {...item} filterElement={(options) => filterTemplate(item, options)}></Column>)
                }
                {
                    (props.onEdit || props.onView || props.onDelete || props.extraButtons?.length) && <Column style={{ width: 100 }} alignFrozen="right" frozen body={renderActions} ></Column>
                }
            </DataTable>
        </div>
    )
});

export default CustomDataTable;

