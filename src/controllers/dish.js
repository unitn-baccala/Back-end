const Dish = require('../models/dish');
const User = require('../models/user');
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
    const description = req.body.description, image = req.body.image, ingredients = req.body.ingredients, categories = req.body.categories;

    if(name == null || String(name).length < 1)
        return fail(400, "invalid name");

    if(ingredients != null && !Array.isArray(ingredients))
        return fail(400, "failed to create dish: invalid 'ingredients' parameter" );

    const found = (await Dish.findOne({ owner_id, name }).exec()) !== null;

    if(found)
        return fail(400, "name taken");

    let ingredients_objid = [];
    let all_ingredients_exist = ingredients.every(ing => {
        try {
            ingredients_objid.push(ObjectId(ing));
            return true;
        } catch(e) {
            return false;
        }
    });

    all_ingredients_exist = all_ingredients_exist && (await Ingredient.find({ _id: { $in: ingredients_objid } })).length == ingredients.length;
    
    if(!all_ingredients_exist)
        return fail(400, "some ingredients do not exist");

    let img_buffer;
    if(typeof image === 'String') {
        try {
            img_buffer = Buffer.from(image, 'base64');
        } catch(e) {
            return fail(400, "failed to convert image from base64");
        }
    }
    
    const document = new Dish({ owner_id, name, description, img_buffer, ingredients, categories }); //implementare tutti i controlli sulle categorie
    const was_saved = (await document.save()) !== null;
    /* istanbul ignore next */
    if(!was_saved)
        return fail(500, "internal server error");
    res.status(201).send({ msg: "dish saved successfully", id: document._id });
}

const deleteDish = async (req, res, next) => {
    const fail = (code, msg) => {
        res.status(code).send({msg: "failed to delete dish: " + msg});
    };

    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null) //this should never happen since the API requires token checking 
        return fail(400, "req.body == null || req.body.token == null");

    const _id = req.body.dish_id, owner_id = req.body.jwt_payload.user_id;

    if(_id == null)
        return fail(400, "req.body.name == null");

    let del_count = (await Dish.deleteOne({ owner_id, _id })).deletedCount;

    if(del_count == 0)
        return fail(400, "no dish with such name");

    res.status(200).send({ msg: "dish deleted successfully" });
}

const getDishes = async (req, res, next) => {
    if (req.query == null) {
        res.status(400).send({ msg: "no parameters"});
        return;
    }
    
    const business_name = req.query.business_name;

    if(business_name == null)
        res.status(400).send({ msg: "no business name specified" });
    else {
        const user = await User.findOne({business_name});
        if(!user) {
            res.status(400).send({ msg: "no such business name found" });
            return;
        }

        const dishes = await Dish.find({ owner_id: user._id });

        if (dishes) {
            res.status(200).send(dishes);
        } else {
            res.status(400).send({ msg: "no dishes found" });
        }
    }
}

module.exports = { createDish, deleteDish, getDishes };