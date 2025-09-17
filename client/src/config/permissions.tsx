// RolePermissions - Individuals
export const ROLE_PERMISSIONS_WRITE = "RolePermissionsWrite";
export const ROLE_PERMISSIONS_READ = "RolePermissionsRead";
export const ROLE_PERMISSIONS_DELETE = "RolePermissionsDelete";

// RolePermissions - Group
export const ROLE_PERMISSIONS = [
    ROLE_PERMISSIONS_READ,
    ROLE_PERMISSIONS_WRITE,
    ROLE_PERMISSIONS_DELETE,
];

// InternalUsers - Individuals
export const INTERNAL_USERS_READ = "InternalUsersRead";
export const INTERNAL_USERS_WRITE = "InternalUsersWrite";
export const INTERNAL_USERS_DELETE = "InternalUsersDelete";

// InternalUsers - Group
export const INTERNAL_USERS_PERMISSIONS = [
    INTERNAL_USERS_READ,
    INTERNAL_USERS_WRITE,
    INTERNAL_USERS_DELETE,
];

// Brands - Individuals
export const BRANDS_WRITE = "BrandsWrite";
export const BRANDS_DELETE = "BrandsDelete";
export const BRANDS_READ = "BrandsRead";

// Brands - Group
export const BRANDS_PERMISSIONS = [
    BRANDS_READ,
    BRANDS_WRITE,
    BRANDS_DELETE,
];

// RoomTypes - Individuals
export const ROOM_TYPES_WRITE = "RoomTypesWrite";
export const ROOM_TYPES_DELETE = "RoomTypesDelete";
export const ROOM_TYPES_READ = "RoomTypesRead";

// RoomTypes - Group
export const ROOM_TYPES_PERMISSIONS = [
    ROOM_TYPES_READ,
    ROOM_TYPES_WRITE,
    ROOM_TYPES_DELETE,
];

// Firmwares - Individuals
export const FIRMWARES_READ = "FirmwaresRead";
export const FIRMWARES_WRITE = "FirmwaresWrite";
export const FIRMWARES_DELETE = "FirmwaresDelete";

// Firmwares - Group
export const FIRMWARES_PERMISSIONS = [
    FIRMWARES_READ,
    FIRMWARES_WRITE,
    FIRMWARES_DELETE,
];

// Countries - Individuals
export const COUNTRIES_WRITE = "CountriesWrite";
export const COUNTRIES_DELETE = "CountriesDelete";
export const COUNTRIES_READ = "CountriesRead";

// Countries - Group
export const COUNTRIES_PERMISSIONS = [
    COUNTRIES_READ,
    COUNTRIES_WRITE,
    COUNTRIES_DELETE,
];

// AppUsers - Individuals
export const APP_USERS_READ = "AppUsersRead";
export const APP_USERS_WRITE = "AppUsersWrite";

// AppUsers - Group
export const APP_USERS_PERMISSIONS = [
    APP_USERS_READ,
    APP_USERS_WRITE,
];

// Devices - Individuals
export const DEVICES_READ = "DevicesRead";
export const DEVICES_WRITE = "DevicesWrite";
export const DEVICES_DELETE = "DevicesDelete";

// Devices - Group
export const DEVICES_PERMISSIONS = [
    DEVICES_READ,
    DEVICES_WRITE,
    DEVICES_DELETE,
];

// Masters - Group
export const MASTERS_PERMISSIONS = [
    ...COUNTRIES_PERMISSIONS,
    ...BRANDS_PERMISSIONS,
    ...ROOM_TYPES_PERMISSIONS
];

// IMA - Group
export const IAM_PERMISSIONS = [
    ...ROLE_PERMISSIONS,
    ...INTERNAL_USERS_PERMISSIONS,
];

// All Unique Permissions
export const ALL_PERMISSIONS = Array.from(
    new Set([
        ...ROLE_PERMISSIONS,
        ...INTERNAL_USERS_PERMISSIONS,
        ...BRANDS_PERMISSIONS,
        ...ROOM_TYPES_PERMISSIONS,
        ...FIRMWARES_PERMISSIONS,
        ...COUNTRIES_PERMISSIONS,
        ...APP_USERS_PERMISSIONS,
        ...DEVICES_PERMISSIONS,
    ])
);
