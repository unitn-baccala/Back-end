const Dish = require('../models/dish')

// POST /dish => createDish
const createDish = async (req, res, next) => { 
    const name = req.body.name, description = req.body.description, image = req.body.image, ingredients = req.body.ingredients;
    if(name == null || String(name).length < 1) {
        res.status(400).send("failed to create dish: invalid name");
        return;
    }

    const found = (await Dish.findOne({ name: name }).exec()) !== null;

    if(found) {
        res.status(400).send("failed to create dish: name taken");
    } else {
        const document = new Dish({ name, description, image, ingredients });
        const wasSaved = (await document.save()) !== null;

        if (wasSaved) {
            res.status(201).send("dish saved successfully");
        } else {
            res.status(500).send("failed to create dish");
        }
    }
}

const deleteDish = async (req, res, next) => {
    const name = req.body.name;

    if(name == null)
        res.status(400).send("failed to delete dish");
    else {
        let del_count = (await Dish.deleteOne({ name: name })).deletedCount;

        if (del_count != 0) {
            res.status(200).send("dish deleted successfully");
        } else {
            res.status(400).send("failed to delete dish");
        }
    }
}


module.exports = { createDish, deleteDish };