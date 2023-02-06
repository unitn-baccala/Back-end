const request = require('./request'); //for http requests

const api_path = '/api/dish';

const auth_post = request.auth_post(api_path), auth_del = request.auth_del(api_path);

let server, mongoose;

const valid_document = { 
    name: 'pizza margherita',
    description: 'our italian chef\'s favourite',
    ingredients: [  ] //array of ids
};
const post_data = [
    [ 201, valid_document ],
    [ 400, valid_document ],
    [ 400, { name: 'pizza margherita' } ],
    [ 400, { name: 'pizza sbagliata', ingredients: true } ],
    [ 400, { name: 'pizza impossibile', ingredients: [ 'non un ObjectId', 'arcobaleno', 'scaglie di drago' ] } ],
    [ 400, { name: '' } ],
    [ 400, { name: null } ],
    [ 400, {} ],
    [ 400, null]
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

    test.each(post_data)("POST (dish creation) %d, %o", async (c,d) => await post(c,d));

    test.each(delete_data)("DELETE (dish deletion) %d, %o", async (c,d) => await del(c,d));
    

    afterAll(async () => {
        server.close();
        await mongoose.disconnect();
    });
});