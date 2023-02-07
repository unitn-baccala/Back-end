const request = require('./request'); //for http requests
const Ingredient = require('../models/ingredient');
const api_path = '/api/ingredient';

const post = request.auth_post(api_path), del = request.auth_del(api_path);

let server, mongoose, jwt;

const valid_document = { name: 'EXAMPLE INGREDIENT NAME' };
const invalid_credentials = [
    [ 404, { email: "not an email", password: "badpw" } ],
    [ 404, { email: "test.user@for.tests.com", password: "incorrectpw" } ],
    [ 400, { email: "test.user@for.tests.com", password: null } ],
    [ 400, { password: "VeryGoodPassword!" } ],
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

    test.each(invalid_credentials)("POST auth %d %o", async (c,d) => await request.post('/api/authenticate')(c,d));

    test("using bad jwt", async () => {
        await post({token: "not really a jwt"})(403, valid_document);
    });

    test("using no jwt", async () => {
        await post({})(401, valid_document);
    });

    test("using jwt", async () => {
        await Ingredient.deleteOne(valid_document).exec();

        await post(jwt)(201, valid_document);
    });


    afterAll(async () => {
        server.close();
        await mongoose.disconnect();
    });
});