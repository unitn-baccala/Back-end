const User = require('../models/user');

// newUser function for post user route
const newUser = (req, res, next) => {
    console.log(req);
    const user = new User({
        username: req.query.user, password: req.query.password
    });
    user.save(function (err) {
       if (err) return handleError(err);
       // saved!
       console.log("User added");
    });
};

module.exports = {newUser};