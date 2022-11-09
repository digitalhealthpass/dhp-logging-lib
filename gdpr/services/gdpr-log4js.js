/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const { addLayout, configure, getLogger } = require('log4js');

class Logger {
    constructor(name, level) {
        this.logger = Logger.setLogger(name, level);
    }

    debug(message) {
        this.logger.debug(message);
    }
    
    info(message, subjectID, url, txID) {
        this.logger.info(message, subjectID, url, txID);
    }

    warn(message) {
        this.logger.warn(message);
    }

    error(message) {
        this.logger.info(message);
    }

    static layout(logEvent) {    
        const log = {
            timestamp: logEvent.startTime,
            level: logEvent.level.levelStr,
            name: logEvent.categoryName,
            'x-hpass-txn-id': logEvent.data[3] || undefined,
            subject_id: logEvent.data[1] || undefined,
            url: logEvent.data[2] || undefined,
            message: logEvent.data[0],
        };

        return JSON.stringify(log);
    }
    
    static setLogger(name, level) {
        addLayout('json', () => {
            return Logger.layout;
        });
        configure({
            appenders: {
                out: {
                    type: 'console', layout: { type: 'json' },
                }
            },
            categories: {
                default: { appenders: ['out'], level},
            },
            disableClustering: true
        });
        return getLogger(name);
    };
};

module.exports = {
    Logger
};
