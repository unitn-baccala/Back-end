const Ingredient = require('../models/ingredient')

// POST /ingredient => createIngredient
const createIngredient = async (req, res, next) => { 
    if (req.body == null) {
        res.status(400).send("failed to create user");
        return;
    }

    const name = req.body.name;
    if(name == null || String(name).length < 1) {
        res.status(400).send("failed to create ingredient: invalid name");
        return;
    }

    const found = (await Ingredient.findOne({ name: name }).exec()) !== null;

    if(found) {
        res.status(400).send("failed to create ingredient: name taken");
    } else {
        let document = new Ingredient ({ name: name });
        const wasSaved = (await document.save()) !== null;

        if (wasSaved) {
            res.status(201).send("ingredient saved successfully");
        } else {
            res.status(500).send("failed to create ingredient");
        }
    }
}

const deleteIngredient = async (req, res, next) => {
    const name = req.body.name;

    if(name == null)
        res.status(400).send("failed to delete ingredient");
    else {
        let del_count = (await Ingredient.deleteOne({ name: name })).deletedCount;

        if (del_count != 0) {
            res.status(200).send("ingredient deleted successfully");
        } else {
            res.status(400).send("failed to delete ingredient");
        }
    }
}


module.exports = { createIngredient, deleteIngredient };