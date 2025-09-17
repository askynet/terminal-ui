import React, { ReactElement, Dispatch, SetStateAction, HTMLAttributeAnchorTarget, ReactNode } from 'react';

export interface AppBreadcrumbProps {
    className?: string;
}

export interface Breadcrumb {
    labels?: string[];
    to?: string;
}

export interface BreadcrumbItem {
    label: string;
    to?: string;
    items?: BreadcrumbItem[];
}

/* Context Types */
export type LayoutState = {
    theme: any;
    isMobile: boolean;
    isSidebar: boolean;
    isSidebarBroken: boolean;
    overlayMenuActive: boolean;
};


export interface LayoutContextProps {
    layoutState: LayoutState;
    setLayoutState: Dispatch<SetStateAction<LayoutState>>;
    onMenuToggle: () => void;
    showSidebar: (show: boolean) => void;
    toogleSidebarCollapse: () => void;
    toggleOverlaySidebar: () => void;
    toogleSidebarBroken: (show: boolean) => void;
}

export interface MenuContextProps {
    activeMenu: string;
    setActiveMenu: Dispatch<SetStateAction<string>>;
}

/* AppConfig Types */
export interface AppConfigProps {
    simple?: boolean;
}

/* AppTopbar Types */
export type NodeRef = any;
export interface AppTopbarRef {
    isSidebar?: any,
    menubutton?: HTMLButtonElement | null;
    topbarmenu?: HTMLDivElement | null;
    topbarmenubutton?: HTMLButtonElement | null;
}

/* AppMenu Types */
type CommandProps = {
    originalEvent: React.MouseEvent<HTMLAnchorElement, MouseEvent>;
    item: MenuModel;
};

export interface MenuProps {
    model: MenuModel[];
}

export interface MenuModel {
    label: string;
    icon?: string;
    items?: MenuModel[];
    to?: string;
    url?: string;
    target?: HTMLAttributeAnchorTarget;
    seperator?: boolean;
}

export interface AppMenuItem extends MenuModel {
    items?: AppMenuItem[];
    badge?: 'UPDATED' | 'NEW';
    badgeClass?: string;
    class?: string;
    preventExact?: boolean;
    visible?: boolean;
    disabled?: boolean;
    replaceUrl?: boolean;
    command?: ({ originalEvent, item }: CommandProps) => void;
    check?: (item: any) => boolean;
}

export interface AppMenuItemProps {
    item?: AppMenuItem;
    parentKey?: string;
    index?: number;
    root?: boolean;
    className?: string;
}

export type ChildContainerProps = {
    children: ReactNode;
};

export type User = {
    userId: number;
    firstName: string;
    lastName: string;
    displayName: string;
    email: string;
    phone?: string;
    countryCode?: string;
    gender?: string;
    profile?: string;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    isSuperAdmin?: boolean;
    isAdmin?: boolean;
    company?: {
        domain: string;
        companyId: string;
        name: string;
    };
    userRole?: string;
    permissions: any[];
};

export type CustomResponse = {
    code: string;
    message: string;
    data: any;
    total?: number;
    filters?: any;
    page?: any;
    search?: any;
    totalPages?: any;
    keys?: any[],
    permissions?: any[]
};

export type AppContextType = {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    signOut: (loading?: boolean) => void;
    setAlert: (message: string, type?: string) => void;
    isScroll: boolean;
    setScroll: (loading: boolean) => void;
    permissions: any[]
};

export interface Routes {
    routeId?: string;
    method: string;
    path: string;
    desc?: string;
}

export interface LayoutProps {
    isSidebar: boolean;
    children: React.ReactNode;
}

export interface Roles {
    roleId: any;
    name: string;
    desc?: string;
}

export interface Role {
    roleId?: any;
    role: string,
    isDefault?: any;
    description?: any;
    createdAt?: any;
    updatedAt?: any;
    permissions?: any[]
}

export interface Permissions {
    permissionId?: any;
    name: string,
    isDefault?: any;
    description?: any;
    createdAt?: any;
    updatedAt?: any;
    routes?: any[]
}

export interface Users {
    userId: any;
    email?: any;
    firstName?: any;
    lastName?: any;
    displayName?: any;
    phone?: any;
    profile?: any;
    ssoType?: any;
    ssoRef?: any;
    isEmailVerified?: any;
    isPhoneVerified?: any;
    isBusinessOwner?: any;
    business?: any;
    isActive?: any;
    createdAt?: any;
    updatedAt?: any
}

export interface UserDoc {
    displayName?: any,
    email?: any,
    phone?: any,
    userId?: string,
    roleId?: any,
    countryId?: any;
    user?: Users,
    role?: UserRoles,
    isActive?: any
}
export interface UserRoles {
    userRoleId: any,
    roleId: any,
    role?: Roles
}

export interface GlobalAttributes {
    id?: any,
    name: any,
    value: any
}