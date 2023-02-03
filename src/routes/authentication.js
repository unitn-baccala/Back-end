const express = require('express');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const router = express.Router();
const User = require('../models/user');

router.post('', async (req, res) => {
    const userEmail = req.body.email, userPassword = req.body.password;
    const foundUser = await User.findOne({ email: userEmail }).exec();

    if (foundUser === null) {
        res.status(404).send("wrong credentials");
    } else {
        if(await argon2.verify(foundUser.password_hash, userPassword)) {
            //user authenticad
            const payload = { email: userEmail };
            const options = { expiresIn: 86400 };
            jwt.sign(payload, process.env.JWT_SECRET, options, (err, jwtToken) => {
                if(err) {
                    //console.log(err);
                    res.status(500).send("error");
                } else {
                    res.status(200).send({ token: jwtToken });
                }
            });
        } else {
            res.status(404).send("wrong credentials");
        }
    }
});

module.exports = router;