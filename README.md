# DHP logging library

## Introduction

This DHP shared library contains common components for logging/tracing and GDPR compliant logging for other backend microservices.

## Usage Guidance

### Logger Class

- The class `Logger` logs messages to the console as JSON messages
- The logger supports the following logging operations: *info, warn, error, debug, trace* 
- The logger allows the setting of a correlation id, allowing for correlating "transactions" across different microservice log entries

### GDPRLogger Class

GDPRLogger exports PII CRUD operation logs to an external datastore for compliance requirements. This module exports a function, getGdprLogger, which returns an instance of GDPRLogger.

The default datastore used is Cloudant, which require following environment variables to be set:

- CLOUDANT_URL : The Cloudant URL found in IBM Cloud service credentials url value
- CLOUDANT_IAM_KEY : The Cloudant IAM key found in IBM Cloud service credentials apikey

To initialize GDPRLogger, place the following code in the middleware where the transaction id is generated, and wrap the return() function.

Session values (transactionId, callerIp, and url) will be sent to the external datastore whenever GDPRLogger.log is called.

The getSession and setSession functions use the cls-hooked library for continuation-local storage, which ensures that the session variables passed to setSession are available (for logging for example) throughout the life of the request. This eliminates the need to pass these values as function parameters throughout the app.

```
const { getSession, setSession } = require('healthpass-logging-lib/gdpr');

const  session = getSession(req, res, logLevel);
session.run(async () => {
	setSession(
		session,
		transactionID,
		callerIp,
		`/datasubmission${req.originalUrl}`,
	);
	return  next();
});
```

To invoke the GDPRLogger to export a PII CRUD operation log entry simply call gdprLogger.log passing the holder id and the CRUD operation being performed.  Note there is no await on gdprLogger.log in the sample below.  This is intentional to insure GDPR logging does not impact the performance of the request.

```
const { getGdprLogger, CRUD_OPERATION } = require('healthpass-logging-lib/gdpr');

const  gdprLogger = getGdprLogger();

gdprLogger.log(holderID, CRUD_OPERATION.CREATE);
```

## Build
```
npm install
```

## Library Licenses

This section lists license details of libraries / dependencies.

| Name                   | License type            | Link                                                         |
| :--------------------- | :---------------------- | :----------------------------------------------------------- |
| @cloudant/cloudant     | Apache-2.0              | git+ssh://git@github.com/cloudant/nodejs-cloudant.git        |
| log4js                 | Apache-2.0              | git+https://github.com/log4js-node/log4js-node.git           |
| pino                   | MIT                     | git+https://github.com/pinojs/pino.git                       |
| assert                 | MIT                     | git+https://github.com/browserify/commonjs-assert.git        |
| chai                   | MIT                     | git+https://github.com/chaijs/chai.git                       |
| eslint                 | MIT                     | git+https://github.com/eslint/eslint.git                     |
| eslint-config-airbnb   | MIT                     | git+https://github.com/airbnb/javascript.git                 |
| eslint-config-node     | ISC                     | git+https://github.com/kunalgolani/eslint-config.git         |
| eslint-config-prettier | MIT                     | git+https://github.com/prettier/eslint-config-prettier.git   |
| eslint-plugin-jsx-a11y | MIT                     | git+https://github.com/jsx-eslint/eslint-plugin-jsx-a11y.git |
| eslint-plugin-node     | MIT                     | git+https://github.com/mysticatea/eslint-plugin-node.git     |
| eslint-plugin-prettier | MIT                     | git+https://github.com/prettier/eslint-plugin-prettier.git   |
| eslint-plugin-react    | MIT                     | git+https://github.com/jsx-eslint/eslint-plugin-react.git    |
| husky                  | MIT                     | git+https://github.com/typicode/husky.git                    |
| mocha                  | MIT                     | git+https://github.com/mochajs/mocha.git                     |
| nodemon                | MIT                     | git+https://github.com/remy/nodemon.git                      |
| nyc                    | ISC                     | git+ssh://git@github.com/istanbuljs/nyc.git                  |
| sinon                  | BSD-3-Clause            | git+ssh://git@github.com/sinonjs/sinon.git                   |
| sinon-chai             | (BSD-2-Clause OR WTFPL) | git+https://github.com/domenic/sinon-chai.git                |
| stream                 | MIT                     | git://github.com/juliangruber/stream.git                     |
| supertest              | MIT                     | git+https://github.com/visionmedia/supertest.git             |