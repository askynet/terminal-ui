import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { isTokenValid } from "../utils/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ProtectedRouteProps = {
    children: React.ReactNode;
};

const authRoutes = ['/login', '/signup', '/reset-password', '/forgot-password', '/delete-account', '/error', '/not-found'];

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isLoggedIn, user, authToken } = useSelector((state: RootState) => state.auth);
    const searchParams = useSearchParams();
    const navigate = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const isValid = isTokenValid(authToken);
        if (!isValid) {
            if (authRoutes.includes(pathname)) {
                return;
            }
            let returnUrl = `${pathname}?${searchParams.toString()}`
            if (returnUrl) {
                const arr = returnUrl.split('?')
                if (authRoutes.includes(arr[0])) {
                    returnUrl = '';
                }
            }
            navigate.push(`/login${returnUrl != '/' ? `?returnUrl=${returnUrl}` : ''}`);
        }
        else if (authToken && isValid && authRoutes.includes(pathname) && !['/delete-account'].includes(pathname)) {
            const returnUrl = searchParams.get('returnUrl') || `/`;
            navigate.push(returnUrl);
        }
    }, [authToken])


    return <>{children}</>;
};

export default ProtectedRoute;