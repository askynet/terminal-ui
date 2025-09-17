import { jwtDecode } from 'jwt-decode';
import { get } from 'lodash';
import moment from 'moment';
import { CONFIG } from '../config/config';

export const getAuthToken = (): string => {
    return localStorage.getItem(CONFIG.AUTH_USER_TOKEN) || '';
};

export const getRefreshToken = (): string | undefined => {
    return localStorage.getItem(CONFIG.AUTH_USER_REFRESH_TOKEN) || '';
};

export const getTokenExpiry = () => {
    try {
        const token = getAuthToken();
        const decoded: any = jwtDecode(token);
        return decoded.exp ? decoded.exp * 1000 : null;
    } catch {
        return null;
    }
}

export const isTokenValid = (userToken: string) => {
    if (!userToken) return false;
    const decoded: any = jwtDecode(userToken);
    if (decoded && decoded.exp) {
        const currentTime = Date.now() / 1000; // Convert to seconds
        return decoded && decoded.exp > currentTime ? decoded : false; // Check if the token is expired
    }
    return false;
};

export const getTokenData = (userToken: string) => {
    if (!userToken) return false;
    const decoded: any = jwtDecode(userToken);
    if (decoded) {
        return decoded;
    }
    return null;
};

export const validateName = (firstName: string, key?: string) => {
    const namePattern = /^[a-zA-Z\s'-.]+$/;
    if (typeof firstName !== 'string' || firstName.trim() === '') {
        return false;
    }
    if (!namePattern.test(firstName)) {
        return false;
    }
    return true;
};
export const validateNumber = (firstName: number, key?: number) => {
    if (typeof firstName !== 'number') {
        return false;
    }
    return true;
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
    const phonePattern = /^\+?(\d{1,3})?\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    // Pattern explanation:
    // ^            : Start of string
    // \+?          : Optional '+' character for country code
    // (\d{1,3})?   : Optional country code (1-3 digits)
    // \s?          : Optional space
    // \(?\d{3}\)?  : Area code with optional parentheses
    // [-.\s]?      : Optional separator (dash, dot, or space)
    // \d{3}        : First 3 digits
    // [-.\s]?      : Optional separator
    // \d{4}        : Last 4 digits
    // $            : End of string

    if (typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
        return false;
    }
    return phonePattern.test(phoneNumber);
};

export const validateStringLength = (input: string) => {
    if (typeof input !== 'string' || input.trim() === '') {
        return false;
    }
    return input.length <= 250;
};

export const validateURL = (url: string): boolean => {
    if (!url || url.trim() === '') {
        return true; // Valid since it's optional
    }

    try {
        // Add scheme if missing
        const prefixedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`;
        new URL(prefixedUrl); // Validate the URL
        return true;
    } catch {
        return false;
    }
};

export const validateCountryCode = (countryCode: string) => {
    const countryCodePattern = /^\+[0-9]{1,3}$/; // Pattern that allows + followed by 1 to 3 digits
    if (typeof countryCode !== 'string' || countryCode.trim() === '') {
        return false;
    }
    if (!countryCodePattern.test(countryCode)) {
        return false;
    }
    return true;
};

export const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || email.trim() === '') {
        return false;
    }
    if (!emailPattern.test(email)) {
        return false;
    }
    return true;
};

export const formatBytes = (bytes = 0, decimals = 2) => {
    if (!bytes) {
        return '';
    }
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const parseYouTubeID = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
};

export const formatString = (str = '') => {
    if (!str) return '';
    return str
        .toLowerCase() // Convert to lowercase
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
};

export const makeSlug = (str = '') => {
    return str
        .toLowerCase() // Convert to lowercase
        .replace(/\b\w/g, (char) => char.toUpperCase())// Capitalize the first letter of each word
        .replace(/ /g, '') // Replace underscores with spaces
};

export const generateRandomId = () => {
    const timestamp = Date.now(); // Current timestamp in milliseconds
    const randomNum = Math.floor(Math.random() * 1000000); // Generate a random number
    return `${timestamp}${randomNum}`;
};

// Function to get the logo URL
export const getCompanyLogo = (logo: string | undefined, fallback: string = '/images/user.svg') => {
    // Return fallback if logo is not defined
    if (!logo) {
        return fallback;
    }
    // Check if logo contains 'http' and return accordingly
    return logo;
};


export const buildQueryParams = (params: any) => {
    const query = new URLSearchParams();

    query.append('limit', (params.limit ? params.limit : 10) || 10);
    query.append('page', (params.page ? params.page : 1) || 1);

    for (const filterField in params.filters) {
        if (params.filters[filterField]) {
            query.append(`filters.${filterField}`, params.filters[filterField]);
        }
    }

    if (typeof params.include == 'object') {
        query.append('include', params.include.join(','));
    } else if (typeof params.include == 'string') {
        query.append('include', params.include);
    }

    for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            const element = params[key];
            if (!['include', 'filters', 'limit', 'page'].includes(key) && element) {
                query.append(`${key}`, element);
            }
        }
    }

    return query.toString();
};

export const getRowLimitWithScreenHeight = ({ headerHeight = 250, footerHeight = 50 } = { headerHeight: 250, footerHeight: 50 }) => {
    const availableHeight = window.innerHeight - headerHeight - footerHeight;
    return Math.max(Math.floor(availableHeight / 50), 10);
};

export const validateFullName = (name: string) => {
    if (!name) {
        return false
    }
    const nameRegex = /^[A-Z][a-z]+(?:[-' ][A-Z][a-z]+)+$/;
    return nameRegex.test(name);
}

export const validateString = (firstName: string, key?: string) => {
    if (!firstName) {
        return false
    }

    const namePattern = /^[a-zA-Z0-9\-_()]+( [a-zA-Z0-9\-_()]+)*$/;
    if (typeof firstName !== 'string' || firstName.trim() === '') {
        return false;
    }
    if (!namePattern.test(firstName)) {
        return false;
    }
    return true;
};

export const formatWithWordsNumber = (num: any) => {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(1) + 'B'; // Billion
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + 'M'; // Million
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + 'K'; // Thousand
    }
    return num.toString(); // Less than 1000
}

export const isVariableString = (name: string) => {
    if (!name) {
        return false
    }
    const nameRegex = /\{\{(\w+)\}\}/g;
    return nameRegex.test(name);
}

export const parseVariableName = (name: string) => {
    if (!name) {
        return name;
    }
    return name.replace(/\{/g, "").replace(/\}/g, "")
}

export const replaceVars = (content: string, vars: any) => {
    return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return vars[key] || match; // replace vlaues || keep placeholder is not found
    });
}

export const convertToSeconds = (minutes = 0, seconds = 1) => {
    return minutes * 60 + seconds;
}

export const convertToMinutesAndSeconds = (totalSeconds = 1) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { minutes, seconds };
}

export const validateAttribute = (attr: any) => {
    const attrRegex = /^[a-zA-Z0-9-_]+$/gm;
    return attrRegex.test(attr);
};

export const getDisplayName = (attr: any) => {
    const firstName = get(attr, 'firstName', '');
    const lastName = get(attr, 'lastName', '');
    return firstName ? `${firstName}${lastName ? ' ' + lastName : ''}` : '';
};

export function validateField(field: string, value: any): boolean {
    const regexValidators: Record<string, any> = {
        countryName: /^[A-Za-z ]{2,20}$/,            // Letters & space, min 2
        countryCode: /^[A-Z]{2,3}$/,               // IN, USA
        language: /^[a-z]{2}(-[A-Z]{2})?$/,        // en or en-US
        currency: /^[A-Z]{3}$/,                    // USD, INR
        currencySymbol: /^[\p{Sc}]$/u              // $, €, ₹
    };

    const regex = typeof regexValidators[field] === 'string' ? new RegExp(regexValidators[field]) : regexValidators[field];
    return regex ? regex.test(value.trim()) : false;
}

export const parseDOB = (dobStr: any) => {
    if (!dobStr) return `<span>N/A</span>`;

    const today = moment();
    let dob = moment(dobStr, 'MM/DD').year(today.year());

    if (!dob.isValid()) return '';

    // Handle past dates by moving to next year
    if (dob.isBefore(today, 'day')) {
        dob = dob.add(1, 'year');
    }

    const daysLeft = dob.diff(today, 'days');
    const formattedDate = dob.format('D MMM');

    if (daysLeft === 0) {
        return `<span class="text-primary font-bold">Birthday 🎉</span>`;
    }

    return `<span class="ml-2" style="font-weight:600;">${formattedDate}</span> <span class="text-primary">(${daysLeft} days left)</span>`;
};

export const makeFirmwareName = (input: any) => {
    if (!input) return '';
    return input.replace(/[^a-zA-Z0-9]/g, '');
}

export const truncateFileName = (fileName: any, maxBaseLength = 15) => {
    const lastDot = fileName.lastIndexOf('.');
    const hasExtension = lastDot !== -1;

    const name = hasExtension ? fileName.slice(0, lastDot) : fileName;
    const ext = hasExtension ? fileName.slice(lastDot) : '';
    const extLength = ext.length;

    const ellipsis = '...';
    const ellipsisLength = ellipsis.length;

    const maxNameLength = maxBaseLength - extLength;

    if (fileName.length <= maxBaseLength || name.length <= ellipsisLength + 2) {
        return fileName;
    }

    const visibleChars = maxNameLength - ellipsisLength;
    const frontChars = Math.ceil(visibleChars / 2);
    const backChars = Math.floor(visibleChars / 2);

    const start = name.slice(0, frontChars);
    const end = name.slice(-backChars);

    return `${start}${ellipsis}${end}${ext}`;
}

export const isValidVersion = (version = '') => {
    if (!version) return false;
    return /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version);
}

export const validateRandomName = (name: string) => {
    if (!name) {
        return false
    }
    return name && name.trim().length > 5;
}