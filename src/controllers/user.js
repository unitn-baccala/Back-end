const User = require('../models/user');

// newUser function for post user route
const newUser = async (req, res, next) => {
    const email = req.query.email, password = req.query.password;
    const user = new User({
        email, password
    });

    //pw must have 1 lowercase letter, 1 uppercase, 1 number and must be between 8 and 32 characters
    if (!password.match(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])([^\s]){8,}$/)) {
        res.status(400).send("failed to create user: insecure password");
        return;
    }

    //email address must be valid
    if (!email.match(/^([_a-z0-9]+[\._a-z0-9]*)(\+[a-z0-9]+)?@(([a-z0-9-]+\.)*[a-z]{2,4})$/)) {
        res.status(400).send("failed to create user: invalid email address");
        return;
    }

    const foundUser = await User.findOne({ username: user.email }).exec();

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

module.exports = { newUser};