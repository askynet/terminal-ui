'use client';
import { get } from 'lodash';
import path from "path";

let serverConfig: any;

if (typeof window === "undefined") {
    try {
        // Absolute path to public folder
        const fs = require('fs')
        const configPath = path.join(process.cwd(), "public/runtime-config.js");
        const content = fs.readFileSync(configPath, "utf-8");

        // runtime-config.js format: window.__CONFIG__ = {...};
        // extract JSON object
        const jsonString = content
            .replace(/^window\.__CONFIG__\s*=\s*/, "")
            .replace(/;$/, "")
            .trim();
        serverConfig = jsonString ? JSON.parse(jsonString) : {};
    } catch (err) {
        console.warn("Failed to read runtime-config.js", err);
        serverConfig = {};
    }
}

declare global {
    interface Window {
        __CONFIG__?: Record<string, any>;
    }
}

export const getEnvVar = (key: string) => {
    if (typeof window !== 'undefined') {
        return get(window.__CONFIG__, key, null);
    }
    return get(serverConfig, key, null);
};

export const CONFIG = {
    APP_NAME: 'Facets Booklet System',
    AUTH_USER: 'AUTH_USER',
    AUTH_USER_TOKEN: 'AUTH_USER_TOKEN',
    AUTH_USER_REFRESH_TOKEN: 'AUTH_USER_REFRESH_TOKEN',
    get APP_ENV() {
        return getEnvVar('NEXT_PUBLIC_APP_ENV') || getEnvVar('APP_ENV');
    },
    get BASE_URL() {
        return getEnvVar('NEXT_PUBLIC_BASE_URL') || getEnvVar('BASE_URL');
    },
    get SOCKET_HOST() {
        return getEnvVar('NEXT_PUBLIC_SOCKET_HOST') || getEnvVar('SOCKET_HOST');
    }
};