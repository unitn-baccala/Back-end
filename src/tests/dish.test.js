const request = require('./request'); //for http requests

const api_path = '/api/dish';
const Ingredient = require('../models/ingredient');
const User = require('../models/user');

const auth_post = request.auth_post(api_path), auth_del = request.auth_del(api_path);

let server, mongoose;

let valid_document = {
    name: 'pizza margherita',
    description: 'our italian chef\'s favourite',
    ingredients: [  ] //array of ids
};
const post_data = [
    [ 400, valid_document ],
    [ 400, { name: 'pizza margherita' } ],
    [ 400, { name: 'pizza sbagliata', ingredients: true } ],
    [ 400, { name: 'pizza impossibile', ingredients: [ 'non un ObjectId', 'arcobaleno', 'scaglie di drago' ] } ],
    [ 400, { name: '' } ],
    [ 400, { name: null } ],
    [ 400, {} ],
    [ 400, null]
];
let delete_data = [
    [ 200, undefined ], // later populated with valid document's _id
    [ 400, undefined ], // later populated with valid document's _id
    [ 400, { dish_id: "not an objid" } ],
    [ 400, { dish_id: null } ],
    [ 400, null ]
];

let post, del, jwt;
describe(api_path, () => {
    beforeAll(async () => {
        let app = require("../app");
        server = app.server;
        mongoose = require('mongoose');
        jwt = await request.init_test_auth();
        post = auth_post(jwt);
        del = auth_del(jwt);

        const user = await User.findOne({email: request.test_credentials.email}).exec();
        const valid_ingredient = await Ingredient.findOne({ name: "farina", owner_id: user._id }).exec();
        valid_document.ingredients.push(valid_ingredient._id);
    });
    test("POST successful dish creation", async () => {
        const dish_id = (await post(201, valid_document)).id;
        delete_data[0][1] = delete_data[1][1] = { dish_id };
    });
    test.each(post_data)("POST (dish creation) %d, %o", async (c,d) => await post(c,d));

    test.each(delete_data)("DELETE (dish deletion) %d, %o", async (c,d) => await del(c,d));
    

    afterAll(async () => {
        server.close();
        await mongoose.disconnect();
    });
});