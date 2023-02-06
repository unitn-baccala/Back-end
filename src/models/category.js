const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true,
    }
}, { versionKey: false });

const Category = mongoose.model("Category", schema);

module.exports = Category;