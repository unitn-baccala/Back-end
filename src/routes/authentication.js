const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.post('', async (req, res) => {
    const userEmail = req.body.email, userPassword = req.body.password;
    const foundUser = await User.findOne({ email: userEmail, password: userPassword }).exec();

    if (foundUser === null){
        res.status(404).send("wrong credentials");
    } else {
        //user authenticad
        const payload = { email: userEmail };
        const options = { expiresIn: 86400 };
        const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, options);

        res.status(200).send({ token: jwtToken });
    }
}
);

module.exports = router;