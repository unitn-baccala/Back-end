const express = require('express');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const router = express.Router();
const User = require('../models/user');

router.post('/authenticate', async (req, res) => {
    const user_email = req.body.email, user_password = req.body.password;
    if(user_password == null || user_email == null) {
        res.status(400).send({ msg : "authentication failed: (req.body.)password == null || email == null" });
    }
    const found_user = await User.findOne({ email: user_email }).exec();

    const wrong_creds_res = { msg: "authentication failed: wrong credentials" };
    const server_error_res = { msg: "authentication failed: error" };

    if (found_user == null) {
        res.status(404).send(wrong_creds_res);
    } else {
        if(await argon2.verify(found_user.password_hash, user_password)) {
            //user authenticated
            const payload = { user_id: found_user._id };
            const options = { expiresIn: 86400 };
            jwt.sign(payload, process.env.JWT_SECRET, options, (err, jwtToken) => {
                if(err) {
                    //console.log(err);
                    res.status(500).send(server_error_res);
                } else {
                    res.status(200).send({ token: jwtToken });
                }
            });
        } else {
            res.status(404).send(wrong_creds_res);
        }
    }
});

module.exports = router;