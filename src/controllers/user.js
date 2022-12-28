const User = require('../models/user');

// newUser function for post user route
const newUser = async (req, res, next) => {
    const user = new User({
        username: req.query.user, password: req.query.password
    });

    

    const foundUser = await User.findOne({ username: user.username }).exec();

    if(foundUser === null) {
        const user = await user.save();
        
        if(user !== null) {
            res.status(201).send("user saved successfully");
        } else {
            res.status(500).send("failed to create user");
        }
    } else {
        res.status(400).send("failed to create user: username taken");
    }
    
};

module.exports = {newUser};