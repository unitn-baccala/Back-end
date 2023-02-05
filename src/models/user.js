const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    business_name: {
        type: String,
        required: true,
    },
    password_hash: {
        type: String,
        required: true,
    },
    enable_2fa: {
        type: Boolean,
        default: false,
    },
}, { versionKey: false });

const User = mongoose.model("User", schema);

module.exports = User;