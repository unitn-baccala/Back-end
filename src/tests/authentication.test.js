const request = require('./request'); //for http requests

const api_path = '/api/ingredient';

const post = request.auth_post(api_path), del = request.auth_del(api_path);

let server, mongoose;
let jwt;

const valid_document = { name: 'EXAMPLE INGREDIENT NAME' };

describe('/api/authenticate', () => {
    beforeAll(async () => {
        let app = require("../app");
        server = app.server;
        mongoose = require('mongoose');
        await app.mongodb_connection_promise;
    });

    test("POST auth", async () => {
        jwt = await request.init_test_auth();
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