const User = require('../models/user');

// newUser function for post user route
const createUser = async (req, res, next) => {
    const username = req.query.user, password = req.query.password;
    const user = new User({
        username, password
    });

    //pw must have 1 lowercase letter, 1 uppercase, 1 number and must be between 8 and 32 characters
    if (!password.match(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])([^\s]){8,32}$/)) {
        res.status(400).send("failed to create user: insecure password");
        return;
    }

    //email address must be valid
    if (!username.match(/^([_a-z0-9]+[\._a-z0-9]*)(\+[a-z0-9]+)?@(([a-z0-9-]+\.)*[a-z]{2,4})$/)) {
        res.status(400).send("failed to create user: invalid email address");
        return;
    }

    const foundUser = await User.findOne({ username: user.username }).exec();

    if (foundUser === null) {
        const user = await user.save();
        
        if (user !== null) {
            res.status(201).send("user saved successfully");
        } else {
            res.status(500).send("failed to create user");
        }
    } else {
        res.status(400).send("failed to create user: username taken");
    }
    
};

module.exports = {createUser};