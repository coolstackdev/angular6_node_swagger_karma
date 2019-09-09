const mongooseError = require('mongoose').Error;

class ServiceError extends Error {
    constructor(message, statusCode, errorCode) {
        if (arguments.length === 1 && message instanceof mongooseError) {
            const err = arguments[0];
            super(message);
            this.convertMongooseError(err);
            return;
        }

        let isObj = typeof message === 'object';

        if (isObj) {
            message = message.message;
            statusCode = message.statusCode;
        }

        super(message);

        this.statusCode = statusCode || 500;
        this.errors = [];

        if (!errorCode) {
            console.error('missing errorCode for ' + message);
        }

        this.errorCode = errorCode;
    }

    convertMongooseError(err) {
        this.errors = err.errors;
        this.errorCode = err.name;
        this.statusCode = statusCodes.BAD_REQUEST;
    }
}

const statusCodes = {
    SUCCESS: 200,
    RESOURCE_CREATED: 201,
    RESOURCE_UPDATED: 204,
    BAD_REQUEST: 400,
    NOT_AUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    METHOD_NOT_ALLOWED: 405,
    INTERNAL_SERVER_ERROR: 500,
    LOGIN_TIME_OUT: 440
};

const errorCodes = {
    INVALID_AUTHORIZATION: 'invalid_authorization',
    INVALID_AUTHORIZATION_PASSWORD: 'login.invalid_authorization_password',
    INVALID_AUTHORIZATION_USERNOTFOUND: 'login.invalid_authorization_userNotFound',
    INVALID_AUTHORIZATION_USERDELETED: 'invalid_authorization_userDeleted',
    INVALID_AUTHENTICATION_SESSIONENDED: 'invalid_authorization_sessionEnded',
    INVALID_AUTHORIZATION_EMPTY_CREDENTIALS: 'invalid_authorization_empty_credentials',
    ERROR_MONGODB_SAVING: 'error_save_database',
    ERROR_MONGODB_FIND: 'error_find_database',
    ERROR_MONGODB_DELETE: 'error_delete_database',
    ERROR_S3_PUTOBJECT: 'error_s3_putobject',
    ERROR_MFI_NOT_CONNECTED: 'error_mfi_offline',
    INVALID_TOKEN: 'forgotPassword.invalid_token',
    ERROR_EMPTY_EMAIL_USERNAME: 'forgotPassword.error_empty_email_username_fields',
    ERROR_EMPTY_TOKEN_PASSWORD: 'error_empty_token_password_fields',
    ERROR_SERVER: 'error_server',
    ERROR_DELETE_USERS_EMPTY_IDS: 'error_delete_users_empty_ids',
    ERROR_DELETE_SCHOOL_EMPTY_IDS: 'error_delete_school_empty_ids',
    ERROR_USER_WAS_NOT_FOUND: 'error_user_was_not_found',
    ERROR_EMAIL_ALREADY_TAKEN: 'error_email_already_taken',
    ERROR_PHONE_ALREADY_TAKEN: 'error_phone_already_taken',
    INVALID_EMAIL: 'invalid_email',
    ERROR_USERNAME_ALREADY_TAKEN: 'error_username_already_taken',
    INVALID_USERS_NOT_FOUND: 'invalid_users_not_found',
    INVALID_DECLINE_CALLED_CALLBACK: 'invalid_decline_called_callback',
    INVALID_DUPLICATE_PROMOCODE: 'invalid_duplicate_promocode',
    INVALID_WRONG_PROMOCODE: 'invalid_wrong_promocode',
    INVALID_DUPLICATE_MONGODB_SAVE: 'invalid_duplicate_mongodb_save',

    //PAYMENTS
    ERROR_SMS_AUTH: 'error_sms_auth',
    ERROR_EDIT_CLOSED_SUBSCRIPTION: 'edit_closed_subscription',
    ERROR_CODE_OR_STATUS_INVALID: 'error_code_or_status_invalid',
    INVALID_CODE_IS_NOT_USED: 'invalid_code_is_not_used',
    ERROR_NOT_ENOUGH_POINTS: 'error_not_enough_points',

    ERROR_PAYPAL_TRANSACTION: 'error_paypal_transaction',

    ERROR_QUIZ_NOT_UPDATED: 'error_quiz_finished_or_not_found',
    INVALID_DELETE_LESSONS_ID_OR_PERMISSION: 'invalid_delete_lessons_id_or_rermission',

    //PERMISSIONS
    INVALID_PERMISSION: 'invalid_permission'
};

module.exports = ServiceError;
module.exports.STATUS = statusCodes;
module.exports.CODE = errorCodes;
