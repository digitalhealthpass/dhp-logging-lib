/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const { Logger } = require('./services/gdpr-log4js');
const cloudantService = require('./services/cloudant');
const {
    DB_NAME,
    GDPR_LOGGER_KEYS,
    CRUD_OPERATION
} = require ('./constants');

const logLevel = 'info';

class GDPRLogger {
    constructor(level) {
        this.level = level;
        this.logger = new Logger('gdpr-logger', this.level);
    }

    async initCloudantConnection() {
        if (this.cloudant) {
            return;
        }
        try {
            this.cloudant = cloudantService.getInstance(this.level);
            await this.cloudant.setupCloudantDB();
        } catch(err) {
            this.logger.error(`${err.message}`);
            throw err;
        }
    }

    async sendToCloudant(payload, dbName) {
        const response = await this.cloudant.createDocumentSafe(payload, dbName);
        if (response.status !== 201 || !response.data) {
            this.logger.error(`Unable to create Cloudant document. ${JSON.stringify(response)}`);
        }
    }

    async readFromCloudant(filename, entity) {
        const dbName = `${ entity }-${ DB_NAME.COS_INFO }`;
        return this.cloudant.readDocumentSafe(filename, dbName);
    }

    async log(req, holderId, operation) {
        const txID = req.local[GDPR_LOGGER_KEYS.TRANSACTION_ID];
        const callerIp = req.local[GDPR_LOGGER_KEYS.CALLER_IP];
        const url = req.local[GDPR_LOGGER_KEYS.REQUEST_URL];

        try {
            this.logger.info(`GDPR: ${operation}`, holderId, url, txID);
            const currentDate = new Date();
            const timestamp = Math.round(currentDate.getTime() / 1000);

            const payload = {
                timestamp,
                subjectId: holderId,
                callerIp,
                url,
                transactionId: txID,
                message: operation,
            };

            await this.sendToCloudant(payload, DB_NAME.GDPR_LOG);
        } catch (err) {
            this.logger.error(`${err.message}`);
        }
    }

    async logCOS(req, filename, operation, entity) {
        try {
            const response = await this.readFromCloudant(filename, entity);
            if (response.status !== 200 || !response.data || !response.data.holder_id) {
                this.logger.error(`COS document not found. Unable to log. ${JSON.stringify(response)}`);
            } else {
                await this.log(req, response.data.holder_id, operation);
            }
        } catch (e) {
            this.logger.error(e.message);
        }
    }
}

const instance = new GDPRLogger(logLevel);

const getGdprLogger = () => {
    return instance;
}

module.exports = {
    getGdprLogger,
    CRUD_OPERATION,
}