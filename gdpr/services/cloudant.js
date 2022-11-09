/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const Cloudant = require('@cloudant/cloudant');
const { Logger } = require('./gdpr-log4js');
const constants = require('../constants');

const cloudantIamKey = process.env.CLOUDANT_IAM_KEY;
const cloudantUrl = process.env.CLOUDANT_URL;

let logger;
let instance;

const validateCloudantConfig = () => {
    const missingVars = [];
    if (!cloudantIamKey) {
        missingVars.push('CLOUDANT_IAM_KEY');
    }
    if (!cloudantUrl) {
        missingVars.push('CLOUDANT_URL');
    }
    return missingVars;
}

const getCloudantNotInitMsg = () => {
    const notInitMsg = 'Cloudant was not initialized during startup, please check configuration';

    const missingVars = validateCloudantConfig();
    const missingConfig = missingVars.length > 0;
    const missingConfigMsg = `Cloudant credentials are missing: ${missingVars}`;

    return missingConfig ? `${notInitMsg}: ${missingConfigMsg}` : notInitMsg;
}

// getInitOptions constructs Cloudant configuration object, which includes credentials and retry config.
function getInitOptions() {
    logger.debug('Retrieving Cloudant credentials and configuration');
    const missingVars = validateCloudantConfig();
    if (missingVars.length > 0) {
        const message = `Cloudant credentials are missing: ${missingVars}`;
        logger.error(message);
        throw new Error(message);
    }
    return {
        url: cloudantUrl,
        maxAttempt: 0, // don't retry failed Cloudant requests
        plugins: [
            {
                iamauth: { iamApiKey: cloudantIamKey },
            },
        ],
    };
}

function initCloudant() {
    let initOptions = {};
    try {
        initOptions = getInitOptions();
    } catch (err) {
        const message = `Failed to getInitOptions for Cloudant: ${err.message}`;
        logger.error(message);
        throw err;
    }

    logger.debug('Initializing Cloudant with provided credentials and configuration');
    return new Promise((resolve, reject) => {
        Cloudant(initOptions, (err, cloudant) => {
            // reject if authentication fails
            if (err) {
                const message = `Failed to initialize Cloudant with provided credentials: ${err.message}`;
                logger.error(message);
                logger.error(err.stack);
                reject(message);
            }
            resolve(cloudant);
        });
    });
}

class CloudantService{
    static getInstance(logLevel) {
        if (!instance) {
            logger = new Logger('gdpr-cloudant', logLevel);
            instance = new CloudantService();
        } else if (!instance.cloudant || !instance.cloudantDB) {
            const message = getCloudantNotInitMsg();
            logger.error(message);
            throw new Error(message);
        }
        return instance;
    }

    async getOrCreateDB(dbName) {
        try {
            await this.cloudant.db.get(dbName);
            const debugMsg = `Successfully got Cloudant database ${dbName}, skipping database creation`;
            logger.debug(debugMsg);
        } catch (err) {
            const debugMsg = `Failed to get Cloudant database ${dbName}: ${err.message}`;
            logger.debug(debugMsg);

            try {
                await this.cloudant.db.create(dbName);
                const infoMsg = `Created Cloudant database ${dbName}`;
                logger.info(infoMsg);
            } catch (e) {
                const errMsg = `Failed to create Cloudant database ${dbName}: ${err.message}`;
                logger.error(errMsg);
                logger.error(e.stack);
                throw e;
            }
        }
    }

    async initDB() {
        const dbName = constants.DB_NAME.GDPR_LOG;
        try {
            // check for database and create if it does not already exist
            logger.debug(`Checking if Cloudant database ${ dbName } exists`);
            await this.getOrCreateDB(dbName);
        } catch (err) {
            const errMsg = `Failed to check whether Cloudant database exists: ${dbName}: ${err.message}`;
            logger.error(errMsg);
            logger.error(err.stack);
            throw err;
        }

        try {
            // set existing database
            logger.debug(`Preparing Cloudant database ${ dbName } for requests`);
            return this.cloudant.use(dbName);
        } catch (err) {
            const errMsg = `Failed to connect to Cloudant database: ${dbName}: ${err.message}`;
            logger.error(errMsg);
            logger.error(err.stack);
            throw err;
        }
    }

    async setupCloudantDB() {
        if (!this.cloudant) {
            try {
                this.cloudant = await initCloudant();
            } catch (err) {
                const errMsg = `Failed to initCloudant: ${err}`;
                logger.error(errMsg);
                throw err;
            }
        }

        if (!this.cloudantDB) {
            try {
                this.cloudantDB = await this.initDB();
            } catch (err) {
                const errMsg = `Failed to initDB: ${err}`;
                logger.error(errMsg);
                throw err;
            }
        }

        logger.info('Successfully initialized Cloudant');
    }

    // readDocumentSafe retrieves document from Cloudant DB(dbName), catching does-not-exist exception.
    async readDocumentSafe(docID, dbName) {
        logger.debug(`Reading Cloudant document safely with _id ${ docID } in database ${ dbName }`);
        try {
            const data = await this.cloudant.use(dbName).get(docID);
            return { status: 200, data };
        } catch (err) {
            return { status: err.statusCode, message: err.error };
        }
    }

    async createDocumentSafe(doc, dbName) {
        try {
            logger.debug(`Creating Cloudant document in database ${ dbName }`);
            const data = await this.cloudant.use(dbName).insert(doc);
            return { status: 201, data };
        } catch (err) {
            return { status: err.statusCode, message: err.error };
        }
    }
}

module.exports = CloudantService;
