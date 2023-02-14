const Dish = require('../models/dish');
const User = require('../models/user');
const Ingredient = require('../models/ingredient');
const Category = require('../models/category');
const failHandler = require('../functions/fail');
const ObjectId = require('mongoose').Types.ObjectId;
const validateObjectIds = require('../functions/validateObjectIds');

const createDish = async (req, res, next) => {
    const fail = failHandler(res, "failed to create dish: ");

    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null)
        return fail(500, "internal server error")
        
    const owner_id = req.body.jwt_payload.user_id, name = req.body.name;
    const description = req.body.description, image = req.body.image, raw_ingredients = req.body.ingredients, raw_categories = req.body.categories;

    if(name == null || String(name).length < 1)
        return fail(400, "invalid name");

    if(raw_ingredients != null && !Array.isArray(raw_ingredients))
        return fail(400, "failed to create dish: invalid 'ingredients' parameter" );
    
    if(raw_categories != null && !Array.isArray(raw_categories))
        return fail(400, "failed to create dish: invalid 'categories' parameter" );

    const found = (await Dish.findOne({ owner_id, name }).exec()) !== null;

    if(found)
        return fail(400, "name taken");


    const ingredients = await validateObjectIds(raw_ingredients, Ingredient);
    const categories = await validateObjectIds(raw_categories, Category);

    if(ingredients == null)
        return fail(400, "some ingredients do not exist");

    if(categories == null)
        return fail(400, "some categories do not exist");

    const document = new Dish({ owner_id, name, description, image, ingredients, categories });
    const was_saved = (await document.save()) !== null;
    /* istanbul ignore next */
    if(!was_saved)
        return fail(500, "internal server error");
    res.status(201).send({ msg: "dish saved successfully", id: document._id });
}

const deleteDish = async (req, res, next) => {
    const fail = failHandler(res, "failed to delete dish: ");

    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null)
        return fail(500, "internal server error");

    const _id = req.body.dish_id, owner_id = req.body.jwt_payload.user_id;

    if(_id == null)
        return fail(400, "req.body.name == null");

    let del_count = (await Dish.deleteOne({ owner_id, _id })).deletedCount;

    if(del_count == 0)
        return fail(400, "no dish with such name");

    res.status(200).send({ msg: "dish deleted successfully" });
}

const getDishes = async (req, res, next) => {
    const fail = failHandler(res, "failed to get dishes: ");
    
    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null)
        return fail(500, "internal server error");
    
    const owner_id = req.body.jwt_payload.user_id

    let dishes = await Dish.find({ owner_id });
    
    for(let i = 0; i < dishes.length; i++)
        if (dishes[i].image != null)
            dishes[i].image = dishes[i].image.toString('base64');

    /* istanbul ignore next */
    if (dishes == null)
        return fail(500, "internal server error");

    res.status(200).send(dishes);
}

module.exports = { createDish, deleteDish, getDishes };