const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    ownerEmail: {
        type: String,
        required: true
    },
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

const Dish = mongoose.model("Dish", schema);

module.exports = Dish;