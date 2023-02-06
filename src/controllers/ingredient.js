const Ingredient = require('../models/ingredient');
const User = require('../models/user');

// POST /ingredient => createIngredient
const createIngredient = async (req, res, next) => { 
    const fail = (code, msg) => {
        res.status(code).send({msg: "failed to create ingredient: " + msg});
    };

    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null) //this should never happen since the API requires token checking 
        return fail(500, "req.body == null || req.body.token == null");

    const name = req.body.name, owner_id = req.body.jwt_payload.user_id; 
    if(name == null || String(name).length < 1)
        return fail(400, "invalid_name");

    const found = (await Ingredient.findOne({ name, owner_id }).exec()) !== null;

    if(found) 
        return fail(400, "name taken");

    let document = new Ingredient ({ name, owner_id });
    const was_saved = (await document.save()) !== null;

    /* istanbul ignore next */
    if(!was_saved)
        return fail(500, "internal server error")

    res.status(201).send({ msg: "ingredient saved successfully" , id: document._id });
}

//TODO: should be checking if the ingredients is used in any dishes
const deleteIngredient = async (req, res, next) => {
    const fail = (code, msg) => {
        res.status(code).send({msg: "failed to delete ingredient: " + msg});
    };
 
    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null) // the function is token checked so this cannot happen
        return fail(500, "req.body == null || req.body.token == null");
    
    const _id = req.body.ingredient_id, owner_id = req.body.jwt_payload.user_id;

    if(_id == null)
        return fail(400, "req.body.ingredient_id == null");

    let del_count = (await Ingredient.deleteOne({ _id, owner_id })).deletedCount;
    if(del_count == 0)
        return fail(400, "no ingredient with such name");

    res.status(200).send({ msg: "ingredient deleted successfully" });
}

const getIngredients = async (req, res, next) => {
    const fail = (code, msg) => {
        res.status(code).send({msg: "failed to retrieve ingredients: " + msg});
    };

    /* istanbul ignore next */
    if (req.query == null) //req.query can be empty but not null so this should not happen
        return fail(400, "no parameters");
    
    const business_name = req.query.business_name;
    if(business_name == null)
        return fail(400, "no business name specified");

    const user = await User.findOne({business_name});
    if(!user)
        return fail(400, "no such business name found");

    const ingredients = await Ingredient.find({ owner_id: user._id });
    if (!ingredients)
        return fail(400, "no ingredients found");
    
    res.status(200).send(ingredients);
}

module.exports = { createIngredient, deleteIngredient, getIngredients };