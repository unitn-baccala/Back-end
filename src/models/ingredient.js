
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
}, { versionKey: false });

const Ingredient = mongoose.model("Ingredient", schema);

module.exports = Ingredient;