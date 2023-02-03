const request = require('./request'); //for http requests

const api_path = '/ingredient';

const post = request.post(api_path), del = request.del(api_path);

let server, mongoose;

const valid_document = { name: 'EXAMPLE INGREDIENT NAME' };
const post_data = [
    [ 201, valid_document ],
    [ 400, valid_document ],
    [ 400, { name: '' } ],
    [ 400, { name: null } ],
];
const delete_data = post_data.map(a => a[0] == 201 ? [200, a[1]] : a);

describe("/ingredient", () => {
    beforeAll(async () => {
        let app = require("../app");
        server = app.server;
        mongoose = require('mongoose');
        await app.mongodb_connection_promise;
        await Promise.allSettled([
            del(200, valid_document),
        ]);
    });
    test.each(post_data)("POST (ingredient creation) %d, %o", post);
    test.each(delete_data)("DELETE (ingredient deletion) %d, %o", del);

    afterAll(async () => {
        server.close();
        await mongoose.disconnect();
    });
});