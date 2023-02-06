const request = require('./request'); //for http requests

const api_path = '/api/dish';

const auth_post = request.auth_post(api_path), auth_del = request.auth_del(api_path);

let server, mongoose;

const valid_document = { 
    name: 'pizza margherita',
    description: 'our italian chef\'s favourite',
    ingredients: [ '63dff59904e85f8fab19c3fe', '63dff59904e85f8fab19c401', '63dff59904e85f8fab19c404' ] 
};
const post_data = [
    [ 201, valid_document ],
    [ 400, valid_document ],
    [ 400, { name: 'pizza margherita' } ],
    [ 400, { name: 'pizza sbagliata', ingredients: true } ],
    [ 400, { name: 'pizza impossibile', ingredients: [ 'arcobaleno', 'scaglie di drago' ] } ],
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
    post_data.forEach((e) => {
        test("POST (dish creation)" + JSON.stringify(e), () => post(e[0], e[1]));
    });
    delete_data.forEach((e) => {
        test("DELETE (dish deletion)" + JSON.stringify(e), () => del(e[0], e[1]));
    });
    //test.each(delete_data)("DELETE (dish deletion) %d, %o", del);
    

    afterAll(async () => {
        server.close();
        await mongoose.disconnect();
    });
});