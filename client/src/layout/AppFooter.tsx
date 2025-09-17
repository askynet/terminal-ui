import React, { useContext } from 'react';
import moment from 'moment-timezone';
import { CONFIG } from '../config/config';

const AppFooter = () => {
    return (
        <div className="layout-footer">
            <span className="font-medium ml-2">{CONFIG.APP_NAME}</span>{' ©' + moment().format('YYYY')}
        </div>
    );
};

export default AppFooter;
