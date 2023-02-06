
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
    dishes: {
        type: Array,
        required: true,
    }
}, { versionKey: false });

const Menu = mongoose.model("Menu", schema);

module.exports = Menu;