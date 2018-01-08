const rp = require('request-promise-native');
const StatusCodeError = require('../errors/StatusCodeError');
const RequestError = require('../errors/RequestError');
const sinon = require('sinon');
const should = require('should');

describe('Validation checks', function() {
    const sandbox = sinon.sandbox.create();
    let stub;
    let request;

    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });

    it('Should throw an error when onSuccess is not a function', function() {
        return request.get({uri: 'www.google.com', onSuccess: 'string'}).should.be.rejectedWith('onSuccess must be a function')
            .then(() => {
                should(stub.callCount).eql(0);
            });
    });
    it('Should throw an error when onError is not a function', function() {
        return request.get({uri: 'www.google.com', onError: 'string'}).should.be.rejectedWith('onError must be a function')
            .then(() => {
                should(stub.callCount).eql(0);
            });
    });
    it('Should throw an error when retryStrategy is not a function', function() {
        return request.get({uri: 'www.google.com', retryStrategy: 'string'}).should.be.rejectedWith('retryStrategy must be a function')
            .then(() => {
                should(stub.callCount).eql(0);
            });
    });
});

describe('When sending get request with default values', function () {
    const sandbox = sinon.sandbox.create();
    let stub;
    let request;
    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return 200 OK response after 1 try', function () {
        const response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com').should.be.fulfilledWith(response.body)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 1 try', function () {
        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com').should.be.rejectedWith(new StatusCodeError(response))
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return an error after 1 try', function () {
        const error = new Error('some error');
        stub.rejects(error);
        return request.get('www.google.com').should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
});

describe('When sending get request with max value set', function () {
    const retry = {max: 3};
    let sandbox;
    let stub;
    let request;
    before(function () {
        sandbox = sinon.sandbox.create();
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return 200 OK response 1 try', function () {
        const response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.fulfilledWith(response.body)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 1 try', function () {
        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 1 try', function () {
        const response = {
            statusCode: 500,
            body: {
                var: 'val'
            }
        };
        const expectedError = new Error(`${response.statusCode} - "${JSON.stringify(response.body)}"`);
        expectedError.name = 'StatusCodeError';
        expectedError.response = response;
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.rejected()
            .then((error) => {
                should(error).be.containDeep(expectedError);
                should(stub.callCount).eql(1);
            });
    });
    it('Should return an error after 3 tries', function () {
        const error = new Error('RequestError');
        stub.rejects(error);
        return request.get('www.google.com', retry).should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When sending request with the default max value and retryOn5xx set to true', function () {
    const retry = {retryOn5xx: true};
    const sandbox = sinon.sandbox.create();
    let stub;
    let request;

    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return 200 OK response 1 try', function () {
        const response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.fulfilledWith(response.body)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 1 try', function () {
        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
});

describe('When sending request with the default max value and retryOn5xx set to true', function () {
    const retry = {retryOn5xx: true, simple: false};
    const sandbox = sinon.sandbox.create();
    let stub;
    let request;

    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return 200 OK response 1 try', function () {
        const response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.fulfilledWith(response.body)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 1 try', function () {
        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 401 response after 1 try', function () {
        const response = {
            statusCode: 401,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.fulfilledWith(response.body)
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
});

describe('When sending get request with max value set to 3 and retryOn5xx set to true', function () {
    const retry = {max: 3, retryOn5xx: true};
    const sandbox = sinon.sandbox.create();
    let stub;
    let request;
    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return 200 OK response 1 try', function () {
        const response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.fulfilledWith(response.body)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 3 tries', function () {
        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
    it('Should return 401 response after 1 try', function () {
        const response = {
            statusCode: 401,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return an error on rejection (network error) after 3 tries', function () {
        const error = new Error('getaddrinfo ENOTFOUND');
        stub.rejects(error);
        return request.get('www.google.com', retry).should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When sending get request with retryOn5xx set to true and simple set to false', function () {
    const retry = {max: 3, retryOn5xx: true, simple: false};
    const sandbox = sinon.sandbox.create();
    let stub;
    let request;
    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return 200 OK response 1 try', function () {
        const response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.fulfilledWith(response.body)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 3 tries', function () {
        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
    it('Should return 401 response after 1 try', function () {
        const response = {
            statusCode: 401,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.fulfilledWith(response.body)
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return an error on rejection (network error) after 3 tries', function () {
        const error = new Error('getaddrinfo ENOTFOUND');
        stub.rejects(error);
        return request.get('www.google.com', retry).should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When setting resolveWithFullResponse=false', function () {
    const sandbox = sinon.sandbox.create();
    let stub;
    let request;
    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return only the body for 200 OK', function () {
        const retry = {resolveWithFullResponse: false};
        const response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.fulfilledWith(response.body)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return only the body for 500 OK', function () {
        const retry = {simple: false, resolveWithFullResponse: false};

        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.fulfilledWith(response.body)
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return return an error for 500 OK and retryOn5xx', function () {
        const retry = {max: 3, retryOn5xx: true, simple: false, resolveWithFullResponse: false};

        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When setting resolveWithFullResponse=true', function () {
    const sandbox = sinon.sandbox.create();
    let stub;
    let request;
    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return only the body for 200 OK', function () {
        const retry = {resolveWithFullResponse: true};
        const response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.fulfilledWith(response)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return only the body for 500 OK', function () {
        const retry = {simple: false, resolveWithFullResponse: true};

        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.fulfilledWith(response)
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return return an error for 500 OK and retryOn5xx', function () {
        const retry = {max: 3, retryOn5xx: true, simple: false, resolveWithFullResponse: true};

        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When passing all options as the first argument', function () {
    const sandbox = sinon.sandbox.create();
    let stub;
    let request;
    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return only the body for 200 OK', function () {
        const retry = {uri: 'www.google.com', resolveWithFullResponse: true};
        const response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get(retry).should.be.fulfilledWith(response)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return only the body for 500 OK', function () {
        const retry = {uri: 'www.google.com', simple: false, resolveWithFullResponse: true};

        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get(retry).should.be.fulfilledWith(response)
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return return an error for 500 OK and retryOn5xx', function () {
        const retry = {uri: 'www.google.com', max: 3, retryOn5xx: true, simple: false, resolveWithFullResponse: true};

        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get(retry).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When sending get request with max value set and retryStrategy given', function () {
    const fn = function (response) {
        return response.statusCode === 401;
    };
    const sandbox = sinon.sandbox.create();
    const retry = {max: 3, retryStrategy: fn};
    let request;
    let stub;

    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return 200 OK response 1 try', function () {
        const response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.fulfilledWith(response.body)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 401 response after 3 tries', function () {
        const response = {
            statusCode: 401,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.rejectedWith(new RequestError(response))
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});

describe('When sending request with onSuccess and onError', function () {
    const sandbox = sinon.sandbox.create();
    const onSuccess = sandbox.stub();
    const onError = sandbox.stub();
    const retry = {max: 3, retryOn5xx: true, onSuccess, onError};
    let request;
    let stub;

    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index');
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return 200 OK response 1 try', function () {
        const response = {
            statusCode: 200,
            body: 'body'
        };
        const expectedOptions = Object.assign({
            uri: 'www.google.com',
            resolveWithFullResponse: true,
            simple: false
        }, retry);

        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.fulfilledWith(response.body)
            .then(() => {
                should(stub.callCount).eql(1);
                should(onSuccess.callCount).eql(1);
                sinon.assert.calledWithMatch(onSuccess, expectedOptions, response, 0);
                should(onError.callCount).eql(0);
            });
    });
    it('Should reject 500 response after 3 tries', function () {
        const response = {
            statusCode: 500,
            body: 'body'
        };
        const expectedOptions = Object.assign({
            uri: 'www.google.com',
            resolveWithFullResponse: true,
            simple: false
        }, retry);

        stub.resolves(response);
        return request.get('www.google.com', retry).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(3);
                should(onSuccess.callCount).eql(0);
                should(onError.callCount).eql(3);
                sinon.assert.calledWithMatch(onError, expectedOptions, response, 3);
            });
    });
    it('Should return 200 response after 3 tries', function () {
        const successRes = {
            statusCode: 200,
            body: 'success'
        };
        const failRes = {
            statusCode: 500,
            body: 'fail'
        };
        stub.resolves(failRes);
        stub.onCall(2).resolves(successRes);
        return request.get('www.google.com', retry).should.be.fulfilledWith(successRes.body)
            .then((response) => {
                should(stub.callCount).eql(3);
                should(onSuccess.callCount).eql(1);
                should(onError.callCount).eql(2);
            });
    });
});

describe('When .defaults', function () {
    const retry = {max: 3, retryOn5xx: true};
    const sandbox = sinon.sandbox.create();
    let stub;
    let request;
    before(function () {
        stub = sandbox.stub(rp, 'get');
        request = require('../index').defaults(retry);
    });
    after(function () {
        stub.restore();
    });
    afterEach(function () {
        sandbox.resetHistory();
    });
    it('Should return 200 OK response 1 try', function () {
        const response = {
            statusCode: 200,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com').should.be.fulfilledWith(response.body)
            .then(() => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should return 500 response after 3 tries', function () {
        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com').should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
    it('Should return 401 response after 1 try', function () {
        const response = {
            statusCode: 401,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com').should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should apply new simple value', function () {
        const overridingOptions = {simple: false};
        const response = {
            statusCode: 401,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', overridingOptions).should.be.fulfilledWith(response.body)
            .then((response) => {
                should(stub.callCount).eql(1);
            });
    });
    it('Should apply new max value', function () {
        const overridingOptions = {max: 5, simple: false};
        const response = {
            statusCode: 500,
            body: 'body'
        };
        stub.resolves(response);
        return request.get('www.google.com', overridingOptions).should.be.rejectedWith(new StatusCodeError(response))
            .then((response) => {
                should(stub.callCount).eql(5);
            });
    });
    it('Should return an error on rejection (network error) after 3 tries', function () {
        const error = new Error('getaddrinfo ENOTFOUND');
        stub.rejects(error);
        return request.get('www.google.com').should.be.rejectedWith(error)
            .then((response) => {
                should(stub.callCount).eql(3);
            });
    });
});