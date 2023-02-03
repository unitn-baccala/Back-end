const User = require('../models/user');


// POST /user => createUser
const createUser = async (req, res, next) => {
    const user = new User({
        email: req.body.email, password: req.body.password
    });

    //pw must have 1 lowercase letter, 1 uppercase, 1 number and must be between 8 and 32 characters
    if (user.password == null || !user.password.match(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])([^\s]){8,}$/)) {
        res.status(400).send("failed to create user: insecure password");
        return;
    }

    //email address must be valid
    if (user.email == null || !user.email.match(/^([_a-z0-9]+[\._a-z0-9]*)(\+[a-z0-9]+)?@(([a-z0-9-]+\.)*[a-z]{2,4})$/)) {
        res.status(400).send("failed to create user: invalid email address");
        return;
    }

    const foundUser = await User.findOne({ email: user.email }).exec();

    if (foundUser === null) {
        const userWasSaved = (await user.save()) !== null;
        
        if (userWasSaved) {
            res.status(201).send("user saved successfully");
        } else {
            res.status(500).send("failed to create user");
        }
    } else {
        res.status(400).send("failed to create user: username taken");
    }
};

// DELETE /user => deleteUser
const deleteUser = async (req, res, next) => {
    const user = new User({
        email: req.body.email, password: req.body.password
    });
    if(user.email == null || user.password == null)
        res.status(400).send("failed to delete user");
    else {
        let del_count = (await User.deleteOne({ email: user.email, password: user.password })).deletedCount;

        if (del_count != 0) {
            res.status(200).send("user deleted successfully");
        } else {
            res.status(400).send("failed to delete user");
        }
    }
}

module.exports = { createUser, deleteUser };
