
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
    start_time: {
        hour: {
            type: Number,
            required: true
        },
        minute: {
            type: Number,
            required: true
        },
    },
    end_time: {
        hour: {
            type: Number,
            required: true
        },
        minute: {
            type: Number,
            required: true
        },
    },
}, { versionKey: false });

const Menu = mongoose.model("Menu", schema);

module.exports = Menu;