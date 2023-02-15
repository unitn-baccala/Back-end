const request = require('./request'); //for http requests
const mongoose = require('mongoose');
const Ingredient = require('../models/ingredient');
const User = require('../models/user');
const Dish = require('../models/dish');
const app = require("../app");
const api_path = '/api/dish';

const auth_post = request.auth_post(api_path), auth_del = request.auth_del(api_path), auth_get = request.auth_get(api_path);

let valid_document = {
    name: 'pizza valida',
    description: 'descrizione',
    ingredients: [  ], //later_populated
    image: 'tecnicamenteBase64zz',
};

const post_data = [
    [ 400, valid_document ],
    [ 400, { name: valid_document.name } ],
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
        const auth_info = await request.init_test_auth();
        jwt = auth_info.jwt;

        //create a valid ingredient to put in the test dish document
        let valid_ingredient = { name: "ingrediente valido", owner_id: auth_info.test_user._id };
        valid_ingredient = 
            await Ingredient.findOne().exec()
            || await new Ingredient(valid_ingredient).save();
    
        valid_document.ingredients.push(valid_ingredient._id);

        await Dish.deleteOne({ owner_id: auth_info.test_user._id, name: valid_document.name });
    });
    test("POST (succeed creation)", async () => {
        const dish_id = (await auth_post(jwt)(201, valid_document)).id;
        delete_data[0][1] = delete_data[1][1] = { dish_id };
    });
    test.each(post_data)("POST (fail creation) %d, %o", async (c,d) => await auth_post(jwt)(c,d));

    test("GET (read)", () => auth_get(jwt)(200, null));

    test.each(delete_data)("DELETE (deletion) %d, %o", async (c,d) => await auth_del(jwt)(c,d));
    
    afterAll(async () => {
        app.server.close();
        await mongoose.disconnect();
    });
});