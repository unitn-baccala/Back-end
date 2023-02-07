const request = require('./request'); //for http requests
const Ingredient = require('../models/ingredient');
const api_path = '/api/ingredient';

const post = request.auth_post(api_path), del = request.auth_del(api_path);

let server, mongoose;

const valid_document = { name: 'EXAMPLE INGREDIENT NAME' };
const post_data = [
    [ 400, valid_document ],
    [ 400, { name: '' } ],
    [ 400, { name: null } ],
    [ 400, { } ],
    [ 400, null ],
];
let delete_data = [
    [ 200, undefined ], // later populated with valid document's _id
    [ 400, undefined ], // later populated with valid document's _id
    [ 400, { dish_id: "not an objid" } ],
    [ 400, { dish_id: null } ],
    [ 400, null ]
];
let jwt;
describe(api_path, () => {
    beforeAll(async () => {
        let app = require("../app");
        server = app.server;
        mongoose = require('mongoose');
        jwt = await request.init_test_auth();
        await Ingredient.deleteOne(valid_document).exec();
    });

    test("POST successful dish creation", async () => {
        const ingredient_id = (await post(jwt)(201, valid_document)).id;
        delete_data[0][1] = delete_data[1][1] = { ingredient_id };
    });
    test.each(post_data)("POST (ingredient creation) %d %o", async (c, d) => await post(jwt)(c,d));

    test.each(delete_data)("DELETE (ingredient deletion) %d %o", async (c, d) => await del(jwt)(c,d));

    test("GET (successful ingredient read)", () => request.get("/api/ingredient?business_name=Nome Ristorante Test")(200, null));

    test("GET (fail ingredient read, wrong business_name)", () => request.get("/api/ingredient?business_name=Ristorante Impossibile")(400, null));

    test("GET (fail ingredient read, no business name)", () => request.get("/api/ingredient")(400, null));
    

    afterAll(async () => {
        server.close();
        await mongoose.disconnect();
    });
});