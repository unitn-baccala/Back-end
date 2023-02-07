
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
    },
    //in minutes since midnight
    start_time: {
        type: Number,
        required: true
    },
    //in minutes since midnight
    end_time: {
        type: Number,
        required: true
    },
}, { versionKey: false });

const Menu = mongoose.model("Menu", schema);

module.exports = Menu;