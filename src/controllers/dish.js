const Dish = require('../models/dish')
const Ingredient = require('../models/ingredient');
const ObjectId = require('mongoose').Types.ObjectId;
// POST /dish => createDish
const createDish = async (req, res, next) => { 
    if (req.body == null || req.body.jwt_payload == null) {
        res.status(400).send({ msg: "failed to create dish: req.body == null || req.token == null" });
        return;
    }

    const owner_id = req.body.jwt_payload.user_id, name = req.body.name;
    const description = req.body.description, image = req.body.image, ingredients = req.body.ingredients;

    if(name == null || String(name).length < 1) {
        res.status(400).send({ msg: "failed to create dish: invalid name" });
        return;
    }

    if(ingredients != null && !Array.isArray(ingredients)) {
        res.status(400).send({ msg: "failed to create dish: invalid 'ingredients' parameter" });
        return;
    }

    const found = (await Dish.findOne({ owner_id, name }).exec()) !== null;

    if(found) {
        res.status(400).send({ msg: "failed to create dish: name taken" });
        return;
    }

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
            try {
                every_ingredient_exists = await ingredient_exists(ingredients[i]);
            } catch (e) {
                every_ingredient_exists = false;
                continue;
            }
        }
    

    if(!every_ingredient_exists) {
        res.status(400).send({ msg: "failed to create dish: some ingredients do not exist" });
        return
    }

    let img_buffer;
    if(typeof image === 'String') {
        try {
            img_buffer = Buffer.from(image, 'base64');
        } catch(e) {
            res.status(400).send({ msg: "failed to create dish: failed to convert image from base64" });
            return;
        }
    }
    
    const document = new Dish({ owner_id, name, description, img_buffer, ingredients });
    const wasSaved = (await document.save()) !== null;

    if (wasSaved) {
        res.status(201).send({ msg: "dish saved successfully" });
    } else {
        res.status(500).send({ msg: "failed to create dish: internal server error" });
    }
}

const deleteDish = async (req, res, next) => {
if (req.body == null || req.body.jwt_payload == null) {
        res.status(400).send({ msg: "failed to create dish: req.body == null || req.body.token == null" });
        return;
    }
    const name = req.body.name, owner_id = req.body.jwt_payload.user_id;

    if(name == null)
        res.status(400).send({ msg: "failed to delete dish: req.body.name == null" });
    else {
        let del_count = (await Dish.deleteOne({ owner_id, name })).deletedCount;

        if (del_count != 0) {
            res.status(200).send({ msg: "dish deleted successfully" });
        } else {
            res.status(400).send({ msg: "failed to delete dish: no dish with such name" });
        }
    }
}


module.exports = { createDish, deleteDish };