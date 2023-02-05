const Ingredient = require('../models/ingredient')

// POST /ingredient => createIngredient
const createIngredient = async (req, res, next) => { 
    if (req.body == null || req.body.jwt_payload == null) {
        res.status(400).send("failed to create ingredient");
        return;
    }

    const name = req.body.name, ownerEmail = req.body.jwt_payload.email; 
    if(name == null || String(name).length < 1) {
        res.status(400).send("failed to create ingredient: invalid name");
        return;
    }

    const found = (await Ingredient.findOne({ name, ownerEmail }).exec()) !== null;

    if(found) {
        res.status(400).send("failed to create ingredient: name taken");
    } else {
        let document = new Ingredient ({ name, ownerEmail });
        const wasSaved = (await document.save()) !== null;

        if (wasSaved) {
            res.status(201).send("ingredient saved successfully");
        } else {
            res.status(500).send("failed to create ingredient");
        }
    }
}

const deleteIngredient = async (req, res, next) => {
    if (req.body == null) {
        res.status(400).send("failed to delete ingredient");
        return;
    }
    const name = req.body.name, ownerEmail = req.body.jwt_payload.email;

    if(name == null)
        res.status(400).send("failed to delete ingredient");
    else {
        let del_count = (await Ingredient.deleteOne({ name, ownerEmail })).deletedCount;

        if (del_count != 0) {
            res.status(200).send("ingredient deleted successfully");
        } else {
            res.status(400).send("failed to delete ingredient");
        }
    }
}

const getIngredients = async (req, res, next) => {
    if (req.params == null) {
        res.status(400).send("no parameters");
        return;
    }
    
    const parameters = req.params;

    if(parameters.business_name == null)
        res.status(400).send("no business_name specified");
    else {
        const ingredients = await Ingredient.find();

        if (ingredients) {
            res.status(200).send("");
        } else {
            res.status(400).send("no ingredients found");
        }
    }
}


module.exports = { createIngredient, deleteIngredient, getIngredients };