/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const CRUD_OPERATION = {
    CREATE: 'CREATE',
    READ: 'READ',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
}
const DB_NAME = {
    GDPR_LOG: 'gdpr-audit-log',
    COS_INFO: 'cos-info'
}

const GDPR_LOGGER_KEYS = {
    TRANSACTION_ID: 'transactionId',
    CALLER_IP: 'callerIp',
    REQUEST_URL: 'requestUrl'
}

module.exports = {
    CRUD_OPERATION,
    DB_NAME,
    GDPR_LOGGER_KEYS,
}
