import axios, { Axios } from 'axios';
import { parseError } from './errors';
import eventEmitter from './event';
import { get, keys, result } from 'lodash';
import { CONFIG } from '../config/config';
import { getAuthToken, getRefreshToken } from '../utils/utils';

let isRefreshing = false;
let pendingRequests: any[] = [];

class CustomError extends Error {
    code: any;
    keys: any;
    error: any;
    constructor({ code, error, keys, message }: any) {
        super(error);
        this.name = this.constructor.name;
        this.code = code;
        this.error = error || message;
        this.keys = keys || [];
        Error.captureStackTrace(this, this.constructor);
    }
}

// Create axios client, pre-configured with baseURL
const APIKit: any = axios.create({
    baseURL: CONFIG.BASE_URL,
    timeout: 60000
});

// auth token interceptor
APIKit.interceptors.response.use(
    (res: any) => {
        let response;
        try {
            response = res.data;
        } catch (error) {
            throw new CustomError({ code: 'FAILED', error: 'Something went wronng. Please logout and re-login again' });
        }

        if (response.code && !['SUCCESS', 'RESET_PASSWORD'].includes(response.code)) {
            throw new CustomError({ code: response.code, error: response.message || response.error || response.code, keys: response.keys || [], });
        }
        else if (response.error) {
            if (!response.error.includes('Error: timeout')) {
                const { code, msg, keys = [] }: any = parseError(response);
                throw new CustomError({ code: code, error: msg, keys: keys, });
            }
        } else if (response) {
            if (response.code === 'AUTH_FAILED') {
                const { code, msg }: any = parseError(response);
                throw new CustomError({ code: code, error: msg, });
            }
            return response;
        }
        throw new CustomError({ code: 'FAILED', error: `App is not responding right now, Please try again` });
    },
    async (error: any) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Prevent retry loops

            // If already refreshing, queue the request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingRequests.push({ resolve, reject });
                }).then((token) => {
                    eventEmitter.emit('token', token)
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axios(originalRequest).then((result: any) => {
                        return result.data;
                    })
                }).catch((err) => Promise.reject(err));
            }

            // Begin refresh process
            isRefreshing = true;

            try {
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Make the refresh token request
                const response = await axios.post(`${CONFIG.BASE_URL}/auth/refresh-token`, {
                    refreshToken,
                })

                const { data } = response.data;

                if (data.token) {
                    eventEmitter.emit('token', data.token)
                }

                // Resolve queued requests
                pendingRequests.forEach((pending) => {
                    pending.resolve(data.token);
                });
                pendingRequests = [];

                // Retry the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${data.token}`;
                return APIKit(originalRequest);
            } catch (err) {
                // Handle refresh token failure (logout user, redirect, etc.)
                pendingRequests.forEach((pending) => {
                    pending.reject(err);
                });
                pendingRequests = [];
                eventEmitter.emit('signOut', {});
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        if (get(error, 'response') && get(error, 'response.data')) {
            const response = get(error, 'response.data');
            if (response.code && !['SUCCESS', 'RESET_PASSWORD'].includes(response.code)) {
                throw new CustomError({ code: response.code, error: response.message || response.error || response.code, keys: response.keys || [], });
            }
            else if (response.error) {
                if (!response.error.includes('Error: timeout')) {
                    const { code, msg, keys = [] }: any = parseError(response);
                    throw new CustomError({ code: code, error: msg, keys: keys, });
                }
            } else if (response) {
                if (response.code === 'AUTH_FAILED') {
                    const { code, msg }: any = parseError(response);
                    throw new CustomError({ code: code, error: msg, });
                }
                return response;
            }
            throw new CustomError({ code: 'FAILED', error: `App is not responding right now, Please try again` });
        }
        return Promise.reject(error);
    }
);

const fetchData = async (method: string, url: string, payload = {}, headers: any = {}, isCache: boolean = false) => {
    try {
        const token = await getAuthToken();
        headers = {
            ...headers,
            Authorization: `Bearer ${token}`
        };

        const response = await APIKit({
            method,
            url,
            data: method !== 'get' ? payload : undefined,
            headers
        });

        return response;
    } catch (err: any) {
        if (axios.isCancel(err)) {
            console.log('Request canceled:', err.message);
        } else {
            console.error('Error fetching data:', err);
        }

        if (err.code === 'AUTH_FAILED') {
            eventEmitter.emit('signOut', {});
        }

        return { code: err.code, message: err.message, data: null, keys: err.keys || [] };
    }
};

// API methods
const PostCall = (url: string, payload = {}, headers = {}) => fetchData('post', url, payload, headers);
const GetCall = (url: string, headers = {}) => fetchData('get', url, {}, headers);
const PutCall = (url: string, payload = {}, headers = {}) => fetchData('put', url, payload, headers);
const DeleteCall = (url: string, payload = {}, headers = {}) => fetchData('delete', url, payload, headers);

const PostPdfCall = async (url: string, payload = {}, headers = {}) => {
    const token = await getAuthToken();
    headers = {
        ...headers,
        responseType: 'blob',
        authorization: `Bearer ${token}`
    };

    try {
        const response = await axios.post(`${CONFIG.BASE_URL}${url}`, payload, { headers });

        // Check if the response.data is a Blob
        if (response.data && (response.data instanceof Blob)) {
            const url = window.URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'downloaded.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url); // Clean up
        } else {
            return response.data
        }
    } catch (error: any) {
        return { code: 'FAILED', message: error.message, data: null };
    }
}

const GetPdfCall = async (url: string, headers = {}) => {
    const token = await getAuthToken();
    headers = {
        ...headers,
        responseType: 'blob',
        Authorization: `Bearer ${token}`
    };

    try {
        return await fetch(`${CONFIG.BASE_URL}${url}`, {
            method: 'GET',
            headers: headers
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const contentDisposition = response.headers.get('content-disposition');
                let filename = 'download.pdf'; // Default filename
                if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
                    const matches = /filename="([^"]*)"/.exec(contentDisposition);
                    if (matches && matches[1]) {
                        filename = matches[1];
                    }
                }

                return response.blob().then((blob) => ({ blob, filename }));
            })
            .then(({ blob, filename }) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
            })
            .catch((error) => {
                return { code: 'FAILED', message: get(error, 'response.data.error', 'Failed to download'), data: null };
            });

    } catch (error: any) {
        return { code: 'FAILED', message: error.message, data: null };
    }
}

export {
    PostCall,
    GetCall,
    PutCall,
    DeleteCall,
    PostPdfCall,
    GetPdfCall
};