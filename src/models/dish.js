const mongoose = require("mongoose");

const DishSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    image: {
        type: Buffer,
        required: false,
    },
    ingredients: {
        type: Array,
        required: false
    },
}, { versionKey: false });

const Dish = mongoose.model("Dish", DishSchema);

module.exports = Dish;