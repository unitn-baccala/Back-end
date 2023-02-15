const Dish = require('../models/dish');
const User = require('../models/user');
const Ingredient = require('../models/ingredient');
const Category = require('../models/category');
const failureResponseHandler = require('../functions/failureResponseHandler');
const ObjectId = require('mongoose').Types.ObjectId;
const validateObjectIds = require('../functions/validateObjectIds');

const createDish = async (req, res, next) => {
    const failResponse = failureResponseHandler(res, "failed to create dish: ");
        
    const owner_id = req.body.jwt_payload.user_id, name = req.body.name;
    const description = req.body.description, image = req.body.image;
    const unvalidated_ingredient_ids = req.body.ingredients;
    const unvalidated_category_ids = req.body.categories;

    if(name == null || String(name).length < 1)
        return failResponse(400, "invalid name");

    const ingredients = await validateObjectIds(unvalidated_ingredient_ids, Ingredient);
    const categories = await validateObjectIds(unvalidated_category_ids, Category);

    if(ingredients == null)
        return failResponse(400, "invalid 'ingredients' parameter" );
    if(categories == null)
        return failResponse(400, "invalid 'categories' parameter" );

    const found = (await Dish.findOne({ owner_id, name }).exec()) !== null;

    if(found)
        return failResponse(400, "name taken");
    
    const document = new Dish({ owner_id, name, description, image, ingredients, categories });
    const was_saved = (await document.save()) !== null;

    /* istanbul ignore next */
    if(!was_saved)
        return failResponse(500, "internal server error");
    
    res.status(201).send({ msg: "dish saved successfully", id: document._id });
};

const deleteDish = async (req, res, next) => {
    const failResponse = failureResponseHandler(res, "failed to delete dish: ");

    const _id = req.body.dish_id, owner_id = req.body.jwt_payload.user_id;

    if(_id == null)
        return failResponse(400, "req.body.name == null");

    let found_and_deleted = (await Dish.deleteOne({ owner_id, _id })).deletedCount != 0;

    if(!found_and_deleted)
        return failResponse(400, "no dish with such name");

    res.status(200).send({ msg: "dish deleted successfully" });
};

const getDishes = async (req, res, next) => {
    const failResponse = failureResponseHandler(res, "failed to get dishes: ");
    
    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null)
        return failResponse(500, "internal server error");
    
    const owner_id = req.body.jwt_payload.user_id

    let dishes = await Dish.find({ owner_id });
    
    for (let i = 0; i < dishes.length; i++)
        if (dishes[i].image != null)
            dishes[i].image = dishes[i].image.toString('base64');

    /* istanbul ignore next */
    if (dishes == null)
        return failResponse(500, "internal server error");

    res.status(200).send(dishes);
};

module.exports = { createDish, deleteDish, getDishes };