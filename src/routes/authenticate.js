const express = require('express');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const router = express.Router();
const User = require('../models/user');

router.post('/authenticate', async (req, res) => {
    const fail = (code, msg) => {
        res.status(code).send({ msg: "authentication failed: "+msg });
    };
    const user_email = req.body.email, user_password = req.body.password;
    if(user_password == null)
        return fail(400, "req.body.password == null");
    if(user_email == null)
        return fail(400, "req.body.email == null");

    const found_user = await User.findOne({ email: user_email }).exec();
    const found_a_user_with_correct_pw = found_user != null && await argon2.verify(found_user.password_hash, user_password);
    if (!found_a_user_with_correct_pw)
        return fail(404, "wrong credentials");
    
    const payload = { user_id: found_user._id };
    const options = { expiresIn: 86400 };
    jwt.sign(payload, process.env.JWT_SECRET, options, (err, jwtToken) => {
        if(err) {
            //console.log(err);
            fail(500, "internal server error");
        } else {
            res.status(200).send({ token: jwtToken });
        }
    });
});

module.exports = router;