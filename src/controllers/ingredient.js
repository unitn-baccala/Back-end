const Ingredient = require('../models/ingredient');
const User = require('../models/user');
const fail = require('../functions/fail');

// POST /ingredient => createIngredient
const createIngredient = async (req, res, next) => { 
    const failMessage = "failed to create ingredient: "

    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null) //this should never happen since the API requires token checking 
        return fail(500, failMessage, "req.body == null || req.body.token == null");

    const name = req.body.name, owner_id = req.body.jwt_payload.user_id; 
    if(name == null || String(name).length < 1)
        return fail(400, failMessage, "invalid_name");

    const found = (await Ingredient.findOne({ name, owner_id }).exec()) !== null;

    if(found) 
        return fail(400, failMessage, "name taken");

    let document = new Ingredient ({ name, owner_id });
    const was_saved = (await document.save()) !== null;

    /* istanbul ignore next */
    if(!was_saved)
        return fail(500, failMessage, "internal server error")

    res.status(201).send({ msg: "ingredient saved successfully" });
}

//TODO: should be checking if the ingredients is used in any dishes
const deleteIngredient = async (req, res, next) => {
    const failMessage = "failed to delete ingredient: "
 
    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null) // the function is token checked so this cannot happen
        return fail(500, failMessage, "req.body == null || req.body.token == null");
    
    const name = req.body.name, owner_id = req.body.jwt_payload.user_id;

    if(name == null)
        return fail(400, failMessage, "req.body.name == null");

    let del_count = (await Ingredient.deleteOne({ name, owner_id })).deletedCount;
    if(del_count == 0)
        return fail(400, failMessage, "no ingredient with such name");

    res.status(200).send({ msg: "ingredient deleted successfully" });
}

const getIngredients = async (req, res, next) => {
    const failMessage = "failed to get ingredients: "

    /* istanbul ignore next */
    if (req.query == null) //req.query can be empty but not null so this should not happen
        return fail(400, failMessage, "no parameters");
    
    const business_name = req.query.business_name;
    if(business_name == null)
        return fail(400, failMessage, "no business name specified");

    const user = await User.findOne({business_name});
    if(!user)
        return fail(400, failMessage, "no such business name found");

    const ingredients = await Ingredient.find({ owner_id: user._id });
    if (!ingredients)
        return fail(400, failMessage, "no ingredients found");
    
    res.status(200).send(ingredients);
}

module.exports = { createIngredient, deleteIngredient, getIngredients };