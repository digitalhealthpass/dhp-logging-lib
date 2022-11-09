/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const assert = require('assert');
const sinon = require("sinon");

const {
    getSession,
    setSession,
    getGdprLogger,
    CRUD_OPERATION
} = require('../../gdpr/index');

const { Logger } = require('../../gdpr/services/gdpr-log4js.js');

const MOCK_HOLDER = 'mockHolder';
const MOCK_TRANSACTION_ID = 'mockTransactionId';
const MOCK_CALLER_IP = 'mockCallerIp';
const MOCK_URL = 'mockUrl';
const MOCK_FILE_NAME = 'mockfile.json';
const MOCK_ENTITY = 'mockEntity';

const LOG_LEVEL = 'INFO';
const LOGGER_NAME = 'gdpr-logger';

/* eslint-disable max-lines-per-function */

describe('LogGDPRLoggerger test', () => {
    const sandbox = sinon.createSandbox();

    const layoutSpy = sandbox.spy(Logger, 'layout');
    const gdprLogger = getGdprLogger('INFO');
    const initConnectionStub = sandbox.stub(gdprLogger, 'initCloudantConnection').returns('ok');
    const sendToCloudantStub = sandbox.stub(gdprLogger, 'sendToCloudant').returns('ok');
    const readFromCloudantStub = sandbox.stub(gdprLogger, 'readFromCloudant');

    afterEach(() => {
        sandbox.reset();
    });
    after(() => {
        sandbox.restore();
    });

    it('log function tests', async () => {
        it('test log', async () => {
            const request = async () => {
                gdprLogger.log(MOCK_HOLDER, CRUD_OPERATION.CREATE);
            }
    
            const session = getSession({}, {});
            await session.runAndReturn(async () => {
                setSession(
                    session,
                    MOCK_TRANSACTION_ID,
                    MOCK_CALLER_IP,
                    MOCK_URL
                );
                await request();
            });
            
            sinon.assert.called(initConnectionStub);
            sinon.assert.called(sendToCloudantStub);
            sinon.assert.called(layoutSpy);
    
            // Verity contents to Cloudant
            const payload = sendToCloudantStub.getCall(0).args[0];
            assert.ok(payload.timestamp);
            assert.strictEqual(payload.subjectId, MOCK_HOLDER);
            assert.strictEqual(payload.callerIp, MOCK_CALLER_IP);
            assert.strictEqual(payload.url, MOCK_URL);
            assert.strictEqual(payload.transactionId, MOCK_TRANSACTION_ID);
            assert.strictEqual(payload.message, CRUD_OPERATION.CREATE);
    
            // Verity contents to log4js
            const layout = JSON.parse(layoutSpy.returnValues[0]);
            assert.ok(layout.timestamp);
            assert.strictEqual(layout.level, LOG_LEVEL);
            assert.strictEqual(layout.name, LOGGER_NAME);
            assert.strictEqual(layout['x-hpass-txn-id'], MOCK_TRANSACTION_ID);
            assert.strictEqual(layout.subject_id, MOCK_HOLDER);
            assert.strictEqual(layout.url, MOCK_URL);
            assert.strictEqual(layout.message, `GDPR: ${CRUD_OPERATION.CREATE}`);
        });
    });
    it('logCOS function tests', async () => {
        const logSub = sandbox.stub(gdprLogger, 'log').resolves('ok');

        it('test logCOS', async () => {
            readFromCloudantStub.resolves({
                data: {
                    holder_id: MOCK_HOLDER
                },
                status: 200
            });
            
            const request = async () => {
                gdprLogger.logCOS(
                    MOCK_FILE_NAME,
                    CRUD_OPERATION.CREATE,
                    MOCK_ENTITY
                );
            }
    
            const session = getSession({}, {});
            await session.runAndReturn(async () => {
                setSession(
                    session,
                    MOCK_TRANSACTION_ID,
                    MOCK_CALLER_IP,
                    MOCK_URL
                );
                await request();
            });
    
            sinon.assert.called(initConnectionStub);
            assert(logSub.calledWith(MOCK_HOLDER, CRUD_OPERATION.CREATE));
        });
        
        it('test logCOS, no holder found, does not log', async () => {
            readFromCloudantStub.resolves({
                data: {
                    holder_id: MOCK_HOLDER
                },
                status: 200
            });
            
            const request = async () => {
                gdprLogger.logCOS(
                    MOCK_FILE_NAME,
                    CRUD_OPERATION.CREATE,
                    MOCK_ENTITY
                );
            }
    
            const session = getSession({}, {});
            await session.runAndReturn(async () => {
                setSession(
                    session,
                    MOCK_TRANSACTION_ID,
                    MOCK_CALLER_IP,
                    MOCK_URL
                );
                await request();
            });
    
            sinon.assert.called(initConnectionStub);
            sinon.assert.notCalled(logSub);
        });
    });
});
