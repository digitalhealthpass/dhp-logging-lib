/* eslint-disable prefer-spread */
/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const getPinoInstance = require('pino');

const DEFAULT_OPTIONS = {
    name: 'default',
    level: 'info',
    redact: {
        paths: [],
        censor: '[redacted]',
    },
    formatters: {
        log(object) {
            return object;
        },
        level(label, number) {
            return {
                level: label,
                severity: number
            };
        },
    },
    correlationId: undefined,
    messageKey: 'message',
};

/**
 * Basic logger that writes to system out in JSON
 * format. It supports redaction and correlating
 * log messages via the constructor options.
 *
 * Currently implemented using pino. See https://github.com/pinojs/pino
 */
class Logger {
    /**
     *
     * @param {*} options configuration options for the logger. See
     * <code>DEFAULT_OPTIONS</code> and
     * https://github.com/pinojs/pino/blob/master/docs/api.md#options for valid
     * values
     * @param {*} destination a <code>Stream</code> for writing to a destination
     * other than system out. See https://github.com/juliangruber/stream
     */
    constructor(options = {}, destination) {
        this.options = {
            ...DEFAULT_OPTIONS,
            ...options
        };

        Object.assign(this.options.formatters, {
            log(object) {
                if (options.correlationId) {
                    // eslint-disable-next-line no-param-reassign
                    object.correlationId = options.correlationId;
                }
                return object;
            },
        });

        this.logger = getPinoInstance(this.options, destination);
    }

    // eslint-disable-next-line class-methods-use-this
    configure() {}

    info(...params) {
        this.logger.info.apply(this.logger, params);
    }

    debug(...params) {
        this.logger.debug.apply(this.logger, params);
    }

    trace(...params) {
        this.logger.trace.apply(this.logger, params);
    }

    error(...params) {
        this.logger.error.apply(this.logger, params);
    }

    fatal(...params) {
        this.logger.fatal.apply(this.logger, params);
    }

    warn(...params) {
        this.logger.warn.apply(this.logger, params);
    }

    child(...params) {
        return this.logger.child.apply(this.logger, params);
    }
}

module.exports = {
    Logger
};