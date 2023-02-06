const request = require('./request'); //for http requests

const api_path = '/api/ingredient';

const auth_post = request.auth_post(api_path), auth_del = request.auth_del(api_path);

let server, mongoose;

const valid_document = { name: 'EXAMPLE INGREDIENT NAME' };
const post_data = [
    [ 201, valid_document ],
    [ 400, valid_document ],
    [ 400, { name: '' } ],
    [ 400, { name: null } ],
    [ 400, { } ],
    [ 400, null ],
];
const delete_data = post_data.map(a => a[0] == 201 ? [200, a[1]] : a);
let post, del, jwt;
describe(api_path, () => {
    beforeAll(async () => {
        let app = require("../app");
        server = app.server;
        mongoose = require('mongoose');
        jwt = await request.init_test_auth();
        post = auth_post(jwt);
        del = auth_del(jwt);
        await Promise.allSettled([
            del(200, valid_document),
        ]);
    });

    test.each(post_data)("POST (ingredient creation) %d %o", async (c, d) => await post(c,d));

    test("DELETE (ingredient deletion) without auth", () => request.del("/api/ingredient")(401, valid_document));

    test("DELETE (ingredient deletion) without auth, null body", () => request.del("/api/ingredient")(401, null));

    test.each(delete_data)("DELETE (ingredient deletion) %d %o", async (c, d) => await del(c,d));

    test("POST (ingredient creation) without auth", () => request.post("/api/ingredient")(401, valid_document));

    test("POST (ingredient creation) without auth, null body", () => request.post("/api/ingredient")(401, null));

    test("GET (ingredient read)", () => request.get("/api/ingredient?business_name=Nome Ristorante Test")(200, null));
    

    afterAll(async () => {
        server.close();
        await mongoose.disconnect();
    });
});