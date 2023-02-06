const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
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
        type: Array, // array of ObjectIds
        required: false
    },
}, { versionKey: false });

const Dish = mongoose.model("Dish", schema);

module.exports = Dish;