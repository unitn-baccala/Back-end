
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
}, { versionKey: false });

const Ingredient = mongoose.model("Ingredient", schema);

module.exports = Ingredient;