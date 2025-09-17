'use client';

import AppPage from '@/layout/AppPage';
import { useAppContext } from '@/layout/AppWrapper';
import { useLayoutContext } from '@/layout/LayoutWrapper';
import { useEffect, useRef, useState } from 'react';
import { buildQueryParams, getRowLimitWithScreenHeight, validateEmail, validateFullName } from '@/utils/utils';
import CustomDataTable, { CustomDataTableRef } from '@/components/CustomDataTable';
import { CustomResponse, Roles, User, UserDoc } from '@/types';
import { ACTIONS, UserForm } from '@/config/constant';
import { DeleteCall, GetCall, PostCall, PutCall } from '@/api/ApiKit';
import { get, set } from 'lodash';
import { INTERNAL_USERS_DELETE, INTERNAL_USERS_WRITE } from '@/config/permissions';
import CenterModal from '@/components/CenterModal';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';

const UserPage = () => {
    const { isLoading, setLoading, setScroll, setAlert } = useAppContext();
    const { layoutState } = useLayoutContext();

    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [data, setData] = useState<UserDoc[]>([]);
    const [roles, setRoles] = useState<Roles[]>([])

    const [isShowSplit, setIsShowSplit] = useState<boolean>(false);
    const [action, setAction] = useState<any>(null);
    const [form, setForm] = useState<UserDoc>({ ...UserForm });
    const [selectedData, setSelectedData] = useState<UserDoc | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    useEffect(() => {
        // fetchRoles();
        setScroll(false)
        return () => {
            setScroll(true)
        }
    }, [])

    const fetchData = async (params?: any) => {
        // if (!params) {
        //     params = { limit: limit, page: page }
        // }
        // setLoading(true);
        // const queryString = buildQueryParams(params);
        // const response: CustomResponse = await GetCall(`/internal-users?${queryString}`);
        // setLoading(false)
        // if (response.code == 'SUCCESS') {
        //     setData(response.data);
        //     if (response.total) {
        //         setTotalRecords(response?.total)
        //     }
        // }
        // else {
        //     setData([]);
        // }
    }

    const fetchRoles = async (params?: any) => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/permission-module/roles?limit=1000`);
        setLoading(false)
        if (response.code == 'SUCCESS') {
            setRoles(response.data);
        }
        else {
            setRoles([]);
        }
    }

    const fetchDetails = async (form: UserDoc) => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/internal-users/${form.userId}`);
        setLoading(false)
        if (response.code == 'SUCCESS') {
            setSelectedData(response.data);
            setForm(response.data)
        }
        else {
            setSelectedData(null);
        }
    }

    const updateInput = (name: string, val: any) => {
        const _form: any = { ...form };
        set(_form, name, val)
        setForm(_form);
    };

    const showAddNew = () => {
        setIsShowSplit(true);
        setAction(ACTIONS.ADD);
        setSelectedData(null);
        setForm({ ...UserForm });
    }

    const closeIcon = () => {
        setSelectedData(null);
        setIsSubmitted(false)
        setIsShowSplit(false)
        setForm({ ...UserForm })
        setAction(null)
    }

    const onRowSelect = async (doc: UserDoc, action: any) => {
        await setSelectedData(doc)
        setAction(action);
        setIsShowSplit(true);
        setForm({ ...doc });
    }

    const onSave = async () => {
        if (isLoading) {
            return;
        }

        setIsSubmitted(true)
        if (!validateEmail(form.email) || !validateFullName(form.displayName) || !form.roleId) {
            return;
        }
        setLoading(true)
        if (action === ACTIONS.ADD) {
            setIsDetailLoading(true)
            const response: CustomResponse = await PostCall(`/internal-users`, form);
            if (response.code == 'SUCCESS') {
                setIsShowSplit(false)
                setAlert('Added!', 'success')
                setAction(null)
                setIsDetailLoading(false);
                fetchData()
            }
            else {
                setIsDetailLoading(false)
                setAlert(response.message)
            }
        }
        else if (action === ACTIONS.EDIT) {
            setIsDetailLoading(true)
            const response: CustomResponse = await PutCall(`/internal-users/${form.userId}`, form);
            if (response.code == 'SUCCESS') {
                setIsShowSplit(false)
                setAlert('Updated!', 'success')
                setIsDetailLoading(false);
                setAction(null)
                dataTableRef.current?.refreshData();
            }
            else {
                setIsDetailLoading(false)
                setAlert(response.message)
            }
        }
        setLoading(false)
    }

    const onDelete = async (doc: User) => {
        setLoading(true)
        const response: CustomResponse = await DeleteCall(`/internal-users/${doc.userId}`);
        if (response.code == 'SUCCESS') {
            closeIcon();
            dataTableRef.current?.updatePaginationAfterDelete('roleId', doc?.userId)
            setAlert('User Deleted Successfully', 'success')
        }
        else {
            setAlert(response.message)
        }
        setLoading(false)
    }

    return <AppPage>
        <div className="grid">
            <div className="col-12">
                <div className={`panel-container ${isShowSplit ? (layoutState.isMobile ? 'mobile-split' : 'split') : ''}`}>
                    <div className="left-panel">
                        <CustomDataTable
                            ref={dataTableRef}
                            title="Users"
                            data={data}
                            limit={limit}
                            page={page}
                            totalRecords={totalRecords}
                            defaultSort="asc"
                            columns={[
                                {
                                    header: 'Name',
                                    field: 'displayName',
                                    sortable: true,
                                    body: (item) => <>{get(item, 'displayName', 'N/A')}</>
                                },
                                {
                                    header: 'Email',
                                    field: 'email',
                                    sortable: true,
                                    body: (item) => <>{get(item, 'email', 'N/A')}</>
                                },
                                {
                                    header: 'Role',
                                    field: 'roleId',
                                    sortable: true,
                                    body: (item) => <>{get(item, 'role', 'N/A')}</>
                                }
                            ]}
                            addPermission={INTERNAL_USERS_WRITE}
                            updatePermission={INTERNAL_USERS_WRITE}
                            deletePermission={INTERNAL_USERS_DELETE}
                            onAdd={() => showAddNew()}
                            onLoad={(params: any) => fetchData(params)}
                            onDelete={(item: any) => onDelete(item)}
                            onEdit={(item: any) => onRowSelect(item, ACTIONS.EDIT)}
                        />
                        <CenterModal
                            isVisible={isShowSplit}
                            width="40rem"
                            title={ACTIONS.VIEW == action ? '' : (ACTIONS.EDIT === action ? 'Edit User' : 'Add User')}
                            onClose={closeIcon}
                            onSave={onSave}
                            content={<>
                                {/* {
                                    isDetailLoading && <div className='center-pos'>
                                        <ProgressSpinner style={{ width: '50px', height: '50px', zIndex: 11111 }} />
                                    </div>
                                } */}

                                {/* Edit Permissions */}
                                {
                                    (action == ACTIONS.ADD || action == ACTIONS.EDIT) && <div className="p-fluid">
                                        <div className="field">
                                            <label htmlFor="name">Name <span className='red'>*</span></label>
                                            <InputText id='name' value={get(form, 'displayName')} validateOnly onChange={(e) => updateInput('displayName', e.target.value)} />
                                            {
                                                isSubmitted && !validateFullName(form.displayName) && <small className="text-red">provide valid name</small>
                                            }
                                        </div>
                                        <div className="field">
                                            <label htmlFor="pocNumber">Role <span className='red'>*</span></label>
                                            <Dropdown
                                                value={get(form, 'roleId')}
                                                options={roles}
                                                filter
                                                filterBy="role"
                                                optionLabel="role"
                                                optionValue="roleId"
                                                onChange={(e) => updateInput('roleId', e.value)}
                                            />
                                            {
                                                isSubmitted && !form.roleId && <small className="text-red">please select role</small>
                                            }
                                        </div>
                                        <div className="field">
                                            <label htmlFor="email">Email <span className='red'>*</span></label>
                                            <InputText id='email' value={get(form, 'email')} validateOnly onChange={(e) => updateInput('email', e.target.value)} disabled={action === ACTIONS.EDIT} />
                                            {
                                                isSubmitted && !validateEmail(form.email) && <small className={'text-red'}>provide valid email address</small>
                                            }
                                        </div>
                                    </div>
                                }
                            </>}
                        />
                    </div>
                </div>
            </div>
        </div>
    </AppPage>
}
export default UserPage;
