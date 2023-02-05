const User = require('../models/user');
const argon2 = require('argon2');

// POST /api/user => createUser
const createUser = async (req, res, next) => {
    if (req.body == null) {
        res.status(400).send({ msg: "failed to create user: req.body == null" });
        return;
    }

    const password = req.body.password;
    let email = req.body.email;
    const business_name = req.body.business_name;

    if (password == null || email == null || business_name == null) {
        res.status(400).send({ msg: "failed to create user: (req.body.)password == null || email == null || business_name == null" });
        return;
    }

    // pw must have 1 (lower of uppercase) letter and must be between 12 and 64 characters
    // the maximum is important to protect from long password DoS attacks
    if (!password.match(/^(?=.*[a-zA-Z])(.{12,64})$/)) {
        res.status(400).send({ msg: "failed to create user: insecure password" });
        return;
    }

    //case insensitiveness
    email = email.toLowerCase();

    //email address must be valid
    if (!email.match(/^([_a-z0-9]+[\._a-z0-9]*)(\+[a-z0-9]+)?@(([a-z0-9-]+\.)*[a-z]{2,4})$/)) {
        res.status(400).send({ msg: "failed to create user: invalid email address" });
        return;
    }

    const email_taken = await User.findOne({ email }).exec() !== null;
    
    if (email_taken) {
        res.status(400).send({ msg: "failed to create user: e-mail address is taken" });
        return;
    }

    const business_name_taken = await User.findOne({ business_name }).exec() !== null;
    if(business_name_taken){
        res.status(400).send({ msg: "failed to create user: business name is taken" });
        return;
    }

    const user = new User({
        email, password_hash: await argon2.hash(password), business_name
    });

    const wasSaved = (await user.save()) !== null;
    
    if (wasSaved) {
        res.status(201).send({ msg: "user saved successfully" });
    } else {
        res.status(500).send({ msg: "failed to create user: internal server error" });
    }
};

// DELETE /api/user => deleteUser
const deleteUser = async (req, res, next) => {
    const email = req.body.email, password = req.body.password;

    if(email == null || password == null)
        res.status(400).send({ msg: "failed to delete user: (req.body.)email == null || password == null" });
    else {
        const user = await User.findOne({ email }).exec()
    
        if(user !== null && await argon2.verify(user.password_hash, password)) {
            let del_count = (await User.deleteOne({ email, password_hash: user.password_hash })).deletedCount;

            if (del_count != 0) {
                res.status(200).send({ msg: "user deleted successfully" });
            } else {
                res.status(500).send({ msg: "failed to delete user: internal server error" });
            }
        } else {
            res.status(400).send({ msg: "failed to delete user: no user with such credentials" });
        }
    }
}

module.exports = { createUser, deleteUser };
