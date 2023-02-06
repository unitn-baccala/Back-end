const request = require('./request'); //for http requests

const api_path = '/api/ingredient';

const post = request.auth_post(api_path), del = request.auth_del(api_path);

let server, mongoose, jwt;

const valid_document = { name: 'EXAMPLE INGREDIENT NAME' };
const invalid_credentials = [
    [ 404, { email: "not an email", password: "badpw" } ],
    [ 404, { email: "test.user@for.tests.com", password: "incorrectpw" } ],
    [ 400, { email: "test.user@for.tests.com", password: null } ],
];
describe('/api/authenticate', () => {
    beforeAll(async () => {
        let app = require("../app");
        server = app.server;
        mongoose = require('mongoose');
    });

    test("POST auth", async () => {
        jwt = await request.init_test_auth();
    });

    invalid_credentials.forEach(([code, data]) => {
        test("POST auth (" + code +")" + JSON.stringify(data), async () => {
            await request.post('/api/authenticate')(code, data);
        })
    });

    test("using bad jwt", async () => {
        await Promise.allSettled([post(jwt)(201, valid_document)]);
        await del({token: "not really a jwt"})(403, valid_document);
    });

    test("using jwt", async () => {
        await Promise.allSettled([post(jwt)(201, valid_document)]);
        await del(jwt)(200, valid_document);
    });


    afterAll(async () => {
        server.close();
        await mongoose.disconnect();
    });
});