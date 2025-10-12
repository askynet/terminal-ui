import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ProtectedRouteProps = {
    children: React.ReactNode;
};

const authRoutes = ['/login', '/error', '/not-found'];

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { passwordToken } = useSelector((state: RootState) => state.auth);
    const searchParams = useSearchParams();
    const navigate = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!passwordToken) {
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
        else if (passwordToken && authRoutes.includes(pathname)) {
            const returnUrl = searchParams.get('returnUrl') || `/`;
            navigate.push(returnUrl);
        }
    }, [passwordToken])

    return <>{children}</>;
};

export default ProtectedRoute;