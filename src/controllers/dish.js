const Dish = require('../models/dish')
const Ingredient = require('../models/ingredient');
const ObjectId = require('mongoose').Types.ObjectId;
// POST /dish => createDish
const createDish = async (req, res, next) => {
    const fail = (code, msg) => {
        res.status(code).send({msg: "failed to create dish: " + msg});
    };

    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null) //this should never happen since the API requires token checking 
        return fail(400, "req.body == null || req.token == null")
        
    const owner_id = req.body.jwt_payload.user_id, name = req.body.name;
    const description = req.body.description, image = req.body.image, ingredients = req.body.ingredients;

    if(name == null || String(name).length < 1)
        return fail(400, "invalid name");

    if(ingredients != null && !Array.isArray(ingredients))
        return fail(400, "failed to create dish: invalid 'ingredients' parameter" );

    const found = (await Dish.findOne({ owner_id, name }).exec()) !== null;

    if(found)
        return fail(400, "name taken");

    const ingredient_exists = async _id => {
        try {
            return (await Ingredient.findOne({ owner_id, _id }).exec()) !== null;
        } catch(e) {
            return false;
        }
    };

    let every_ingredient_exists = true;
    if(ingredients != null)
        for(let i = 0; i < ingredients.length && every_ingredient_exists; i++) {
            every_ingredient_exists = await ingredient_exists(ingredients[i]);
        }
    

    if(!every_ingredient_exists)
        return fail(400, "some ingredients do not exist");

    let img_buffer;
    if(typeof image === 'String') {
        try {
            img_buffer = Buffer.from(image, 'base64');
        } catch(e) {
            return fail(400, "failed to convert image from base64");
        }
    }
    
    const document = new Dish({ owner_id, name, description, img_buffer, ingredients });
    const was_saved = (await document.save()) !== null;
    /* istanbul ignore next */
    if(!was_saved)
        return fail(500, "internal server error");
    res.status(201).send({ msg: "dish saved successfully" });
}

const deleteDish = async (req, res, next) => {
    const fail = (code, msg) => {
        res.status(code).send({msg: "failed to delete dish: " + msg});
    };

    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null) //this should never happen since the API requires token checking 
        return fail(400, "req.body == null || req.body.token == null");

    const name = req.body.name, owner_id = req.body.jwt_payload.user_id;

    if(name == null)
        return fail(400, "req.body.name == null");

    let del_count = (await Dish.deleteOne({ owner_id, name })).deletedCount;

    if(del_count == 0)
        return fail(400, "no dish with such name");

    res.status(200).send({ msg: "dish deleted successfully" });
}


module.exports = { createDish, deleteDish };