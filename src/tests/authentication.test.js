const request = require('./request'); //for http requests
const Ingredient = require('../models/ingredient');
const ingredient_api_path = '/api/ingredient';
const api_path = '/api/user/login';

const post = request.auth_post(ingredient_api_path), del = request.auth_del(ingredient_api_path);

let server, mongoose, jwt;

const valid_document = { name: 'EXAMPLE INGREDIENT NAME' };
const invalid_credentials = [
    [ 404, { email: "not an email", password: "badpw" } ],
    [ 404, { email: "test.user@for.tests.com", password: "incorrectpw" } ],
    [ 400, { email: "test.user@for.tests.com", password: null } ],
    [ 400, { password: "VeryGoodPassword!" } ],
];
describe(api_path, () => {
    beforeAll(async () => {
        let app = require("../app");
        server = app.server;
        mongoose = require('mongoose');

        jwt = await request.init_test_auth();
    });

    test.each(invalid_credentials)("POST auth %d %o", async (c,d) => await request.post(api_path)(c,d));

    test("using bad jwt", async () => {
        await post({token: "not really a jwt"})(401, valid_document);
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