const Ingredient = require('../models/ingredient');
const User = require('../models/user');
const failureResponseHandler = require('../functions/failureResponseHandler');

const createIngredient = async (req, res, next) => { 
    const failResponse = failureResponseHandler(res, "failed to create ingredient: ");

    const name = req.body.name, owner_id = req.body.jwt_payload.user_id; 

    if(name == null || String(name).length < 1)
        return failResponse(400, "invalid name");

    const found = (await Ingredient.findOne({ name, owner_id }).exec()) !== null;

    if(found) 
        return failResponse(400, "name taken");

    let document = new Ingredient ({ name, owner_id });
    const was_saved = (await document.save()) !== null;

    /* istanbul ignore next */
    if(!was_saved)
        return failResponse(500, "internal server error")

    res.status(201).send({ msg: "ingredient saved successfully" , id: document._id });
};

//TODO: should be checking if the ingredients is used in any dishes
const deleteIngredient = async (req, res, next) => {
    const failResponse = failureResponseHandler(res, "failed to delete ingredient: ");
 
    const _id = req.body.ingredient_id, owner_id = req.body.jwt_payload.user_id;

    if(_id == null)
        return failResponse(400, "req.body.ingredient_id == null");

    let found_and_deleted = (await Ingredient.deleteOne({ _id, owner_id })).deletedCount != 0;

    if(!found_and_deleted)
        return failResponse(400, "no ingredient with such id");

    res.status(200).send({ msg: "ingredient deleted successfully" });
};

const getIngredients = async (req, res, next) => {
    const failResponse = failureResponseHandler(res, "failed to get ingredients: ");

    const owner_id = req.body.jwt_payload.user_id;

    const ingredients = await Ingredient.find({ owner_id });

    /* istanbul ignore next */
    if (ingredients == null)
        return failResponse(500, "internal server error");
    
    res.status(200).send(ingredients);
};

module.exports = { createIngredient, deleteIngredient, getIngredients };