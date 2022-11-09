/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const assert = require('assert');
const stream = require('stream');

const {
    Logger
} = require('../../index');

const generateStream = (func) => {
    const Stream = stream.Writable;

    // eslint-disable-next-line no-underscore-dangle
    Stream.prototype._write = func;
    return new Stream();
}

describe('Logger tests', () => {
    it('correlationId is printed', () => {
        let loggedMessage;
        const stream = generateStream((chunk) => {
            loggedMessage = JSON.parse(chunk.toString());
        });

        const logger = new Logger(
            {
                correlationId: '123',
            },
            stream
        );

        logger.info('message');

        assert.ok(loggedMessage.correlationId);
    });

    it('string message is printed', () => {
        let loggedMessage;
        const stream = generateStream((chunk) => {
            loggedMessage = JSON.parse(chunk.toString());
        });

        const logger = new Logger({}, stream);

        const message = 'message';
        logger.info(message);

        assert.equal(loggedMessage.message, message);
    });

    it('logger name is printed', () => {
        let loggedMessage;
        const stream = generateStream((chunk) => {
            loggedMessage = JSON.parse(chunk.toString());
        });

        const loggerName = 'logger';
        const logger = new Logger(
            {
                name: loggerName,
            },
            stream
        );

        const message = 'message';
        logger.info(message);

        assert.equal(loggedMessage.name, loggerName);
    });

    it('child logger inherits parent attributes but overrides name', () => {
        let loggedMessage;
        const stream = generateStream((chunk) => {
            loggedMessage = JSON.parse(chunk.toString());
        });

        const loggerName = 'logger';
        const correlationId = '123';
        let logger = new Logger({
            name: loggerName,
            correlationId,
        }, stream);

        const newName = 'new logger';

        logger = logger.child({
            name: newName
        });

        const message = 'message';

        logger.info(message);

        assert.equal(loggedMessage.correlationId, correlationId);
        assert.equal(loggedMessage.name, newName);
    });

});
