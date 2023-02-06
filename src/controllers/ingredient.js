const Ingredient = require('../models/ingredient')

// POST /ingredient => createIngredient
const createIngredient = async (req, res, next) => { 
    if (req.body == null || req.body.jwt_payload == null) {
        res.status(400).send({ msg: "failed to create ingredient: req.body == null || req.body.token == null" });
        return;
    }

    const name = req.body.name, owner_id = req.body.jwt_payload.user_id; 
    if(name == null || String(name).length < 1) {
        res.status(400).send({ msg: "failed to create ingredient: invalid name" });
        return;
    }

    const found = (await Ingredient.findOne({ name, owner_id }).exec()) !== null;

    if(found) {
        res.status(400).send({ msg: "failed to create ingredient: name taken" });
    } else {
        let document = new Ingredient ({ name, owner_id });
        const was_saved = (await document.save()) !== null;

        if (was_saved) {
            res.status(201).send({ msg: "ingredient saved successfully" });
        } else {
            res.status(500).send({ msg: "failed to create ingredient" });
        }
    }
}

const deleteIngredient = async (req, res, next) => {
    //TODO: should be checking if the ingredients is used in any dishes
    if (req.body == null || req.body.jwt_payload == null) {
        res.status(400).send({ msg: "failed to delete ingredient: req.body == null || req.body.token == null" });
        return;
    }
    const name = req.body.name, owner_id = req.body.jwt_payload.user_id;

    if(name == null)
        res.status(400).send({ msg: "failed to delete ingredient: req.body.name == null" });
    else {
        let del_count = (await Ingredient.deleteOne({ name, owner_id })).deletedCount;

        if (del_count != 0) {
            res.status(200).send({ msg: "ingredient deleted successfully" });
        } else {
            res.status(400).send({ msg: "failed to delete ingredient: no ingredient with such name" });
        }
    }
}

const getIngredients = async (req, res, next) => {
    if (req.params == null) {
        res.status(400).send({ msg: "no parameters"});
        return;
    }
    
    const business_name = req.params.business_name;

    if(business_name == null)
        res.status(400).send({ msg: "no business_name specified" });
    else {
        const ingredients = await Ingredient.find({ business_name });

        if (ingredients) {
            res.status(200).send(ingredients);
        } else {
            res.status(400).send({ msg: "no ingredients found" });
        }
    }
}


module.exports = { createIngredient, deleteIngredient, getIngredients };