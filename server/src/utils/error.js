const ERRORS = {
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    INVALID_PARAM: 'INVALID_PARAM',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    NOT_FOUND: 'NOT_FOUND',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    NO_FILE_UPLOAD: 'NO_FILE_UPLOAD',
    INVALID_DATA: 'INVALID_DATA',
    EMPTY_DATA: 'EMPTY_DATA',
    ALREADY_PRESENT: 'ALREADY_PRESENT',
    REQUIRED: 'REQUIRED',
    ACC_NOT_FOUND: 'ACC_NOT_FOUND'
};

const handleCatchError = (req, res, error) => {
    console.error('error', error)
    res.status(500).json({
        code: ERRORS.FAILED,
        error: getErrorMessage(error, req)
    });
}

const throwError = (req, res, code, param) => {
    res.status(405).json({
        code: ERRORS.FAILED,
        error: code
    });
}

const getErrorMessage = (error, req) => {
    console.log('handleCatchError: get error message:', error.name);
    let lang = req.lang || 'en';
    let message = this.getMessage(lang, ERROR_CODES.SOMETHING_WENT_WRONG);

    if (get(req, 'method', '').toLowerCase() == 'post' && error.name === 'SequelizeUniqueConstraintError') {
        message = this.getMessage(lang, ERROR_CODES.DUPLICATE_RECORD);
    }
    else if (error.message.indexOf('cannot be null') > -1) {
        message = this.getMessage(lang, error.message);
    }
    else {
        message = (config.env == 'dev' || error.name == 'AppError') ? error.message : this.getMessage(lang, error.message)
    }
    console.log('message', message)
    return message;
} 

module.exports = {
    ERRORS,
    handleCatchError,
    throwError,
    getErrorMessage
}