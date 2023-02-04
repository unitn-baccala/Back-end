const User = require('../models/user');
const argon2 = require('argon2');

// POST /api/user => createUser
const createUser = async (req, res, next) => {
    if (req.body == null) {
        res.status(400).send("failed to create user");
        return;
    }

    const password = req.body.password;
    let email = req.body.email;

    if (password == null || email == null) {
        res.status(400).send("failed to create user");
        return;
    }

    // pw must have 1 lowercase letter, 1 uppercase, 1 number and must be between 8 and 64 characters
    // the maximum is important to protect from long password DoS attacks
    if (!password.match(/^(?=.*[a-zA-Z])(.{12,64})$/)) {
        res.status(400).send("failed to create user: insecure password");
        return;
    }

    //case insensitiveness
    email = email.toLowerCase();

    //email address must be valid
    if (!email.match(/^([_a-z0-9]+[\._a-z0-9]*)(\+[a-z0-9]+)?@(([a-z0-9-]+\.)*[a-z]{2,4})$/)) {
        res.status(400).send("failed to create user: invalid email address");
        return;
    }

    const wasFound = await User.findOne({ email }).exec() !== null;
    
    if (wasFound) {
        res.status(400).send("failed to create user: username taken");
    } else {
        const user = new User({
            email: req.body.email, password_hash: await argon2.hash(password)
        });

        const wasSaved = (await user.save()) !== null;
        
        if (wasSaved) {
            res.status(201).send("user saved successfully");
        } else {
            res.status(500).send("failed to create user");
        }
    }
};

// DELETE /api/user => deleteUser
const deleteUser = async (req, res, next) => {
    const email = req.body.email, password = req.body.password;

    if(email == null || password == null)
        res.status(400).send("failed to delete user");
    else {
        const user = await User.findOne({ email }).exec()
    
        if(user !== null && await argon2.verify(user.password_hash, password)) {
            let del_count = (await User.deleteOne({ email, password_hash: user.password_hash })).deletedCount;

            if (del_count != 0) {
                res.status(200).send("user deleted successfully");
            } else {
                res.status(500).send("failed to delete user");
            }
        } else {
            res.status(400).send("failed to delete user");
        }
    }
}

module.exports = { createUser, deleteUser };
