const mongoose = require('mongoose');
const request = require('./request'); //for http requests
const Ingredient = require('../models/ingredient');
const app = require('../app');

const ingredient_api_path = '/api/ingredient';

const post = request.auth_post(ingredient_api_path);

let jwt;

const valid_document = { name: 'EXAMPLE INGREDIENT NAME' };

describe("tokenChecker", () => {
    beforeAll(async () => {
        jwt = (await request.init_test_auth()).jwt;
    });

    test("POST fail with bad jwt", async () => {
        await post({token: "not really a jwt"})(401, valid_document);
    });

    test("POST fail with no jwt", async () => {
        await post({})(401, valid_document);
    });

    test("POST succeed with jwt", async () => {
        await Ingredient.deleteOne(valid_document).exec();

        await post(jwt)(201, valid_document);
    });


    afterAll(async () => {
        app.server.close();
        await mongoose.disconnect();
    });
});