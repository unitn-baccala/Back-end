const request = require('./request'); //for http requests
const Ingredient = require('../models/ingredient');
const User = require('../models/user');
const Dish = require('../models/dish');

const api_path = '/api/dish';

const auth_post = request.auth_post(api_path), auth_del = request.auth_del(api_path), auth_get = request.auth_get(api_path);

let server, mongoose;

let valid_document = {
    name: 'pizza margherita',
    description: 'our italian chef\'s favourite',
    ingredients: [  ] //later_populated
};
const post_data = [
    [ 400, valid_document ],
    [ 400, { name: 'pizza margherita' } ],
    [ 400, { name: 'pizza sbagliata', ingredients: true } ],
    [ 400, { name: 'pizza sbagliata 2', categories: 2 } ],
    [ 400, { name: 'pizza impossibile', ingredients: [ 'non un ObjectId', 'arcobaleno', 'scaglie di drago' ] } ],
    [ 400, { name: 'pizza impossibile 2', categories: [ 'non un ObjectId' ] } ],
    [ 400, { name: 'pizza con objid inesistente', ingredients: [ '63e1272db590ba7110e19bbc' ] } ],
    [ 400, { name: 'pizza con objid inesistente 2', categories: [ '63e1272db590ba7110e19bbc' ] } ],
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

let jwt;
describe(api_path, () => {
    beforeAll(async () => {
        let app = require("../app");
        server = app.server;
        mongoose = require('mongoose');
        jwt = await request.init_test_auth();

        const user = await User.findOne({email: request.test_credentials.email}).exec();
        const valid_ingredient = await Ingredient.findOne({ name: "farina", owner_id: user._id }).exec();
        valid_document.ingredients.push(valid_ingredient._id);
        await Promise.allSettled([
            Dish.deleteOne({ owner_id: user._id, name: valid_document.name })
        ]);
    });
    test("POST (succeed creation)", async () => {
        const dish_id = (await auth_post(jwt)(201, valid_document)).id;
        delete_data[0][1] = delete_data[1][1] = { dish_id };
    });
    test.each(post_data)("POST (fail creation) %d, %o", async (c,d) => await auth_post(jwt)(c,d));

    test.each(delete_data)("DELETE (deletion) %d, %o", async (c,d) => await auth_del(jwt)(c,d));
    
    test("GET (read)", () => auth_get(jwt)(200, null));

    afterAll(async () => {
        server.close();
        await mongoose.disconnect();
    });
});