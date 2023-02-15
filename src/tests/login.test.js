const mongoose = require('mongoose');
const request = require('./request'); //for http requests
const app = require('../app');

const api_path = '/api/user/login';

const post = request.post(api_path);

const invalid_credentials = [
    [ 404, { email: "not an email", password: "badpw" } ],
    [ 404, { email: "test.user@for.tests.com", password: "incorrectpw" } ],
    [ 400, { email: "test.user@for.tests.com", password: null } ],
    [ 400, { password: "VeryGoodPassword!" } ],
];
describe(api_path, () => {
    test("successful login", async () => {
        await request.init_test_auth();
    });

    test.each(invalid_credentials)("POST with jwt %d %o", async (code, data) => await post(code,data));

    afterAll(async () => {
        app.server.close();
        await mongoose.disconnect();
    });
});