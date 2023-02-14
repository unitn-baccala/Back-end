const User = require('../models/user');
const Ingredient = require('../models/ingredient');
const Dish = require('../models/dish');
const Category = require('../models/category');
const Menu = require('../models/menu');
const argon2 = require('argon2');
const failHandler = require('../functions/fail');
const jwt = require('jsonwebtoken');


const createUser = async (req, res, next) => {
    const fail = failHandler(res, "failed to create user: ");

    /* istanbul ignore next */
    if(req.body == null) //req.body can be empty but not null so this should not happen
        return fail(400, "req.body == null");

    const password = req.body.password;
    let email = req.body.email;
    const business_name = req.body.business_name;

    if(req.body.password == null)
        return fail(400, "req.body.password == null");
    if(req.body.email == null)
        return fail(400, "req.body.email == null");
    if(req.body.business_name == null)
        return fail(400, "req.body.business_name == null");

    // pw must have 1 (lower of uppercase) letter and must be between 12 and 64 characters
    // the maximum is important to protect from long password DoS attacks
    if (!password.match(/^(?=.*[a-zA-Z])(.{12,64})$/))
        return fail(400, "insecure password");

    //case insensitiveness
    email = email.toLowerCase();

    //email address must be valid
    if (!email.match(/^([_a-z0-9]+[\._a-z0-9]*)(\+[a-z0-9]+)?@(([a-z0-9-]+\.)*[a-z]{2,4})$/))
        return fail(400, "invalid email address");

    const email_taken = await User.findOne({ email }).exec() !== null;
    if (email_taken)
        return fail(400, "email address is taken");

    const business_name_taken = await User.findOne({ business_name }).exec() !== null;
    if(business_name_taken)
        return fail(400, "business name is taken")

    const password_hash = await argon2.hash(password);
    const document = new User({ email, password_hash, business_name });
    const user_was_saved = (await document.save()) !== null; 
    
    /* istanbul ignore next */
    if(!user_was_saved)
        return fail(500, "internal server error");
    res.status(201).send({ msg: "user saved successfully" });
};

const authenticateUser = async (req, res) => {
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
        /* istanbul ignore next */
        if(err) {
            //console.log(err);
            fail(500, "internal server error");
        } else {
            res.status(200).send({ token: jwtToken });
        }
    });
};


const deleteUser = async (req, res, next) => {
    const fail = failHandler(res, "failed to delete user: ");

    /* istanbul ignore next */
    if(req.body == null || req.body.jwt_payload == null)
        return fail(400, "req.body == null || req.body.token == null");
    

    const email = req.body.email, password = req.body.password, user_id = req.body.jwt_payload.user_id;
    
    if(email == null) 
        return fail(400, "req.body.email == null");
    if(password == null) 
        return fail(400, "req.body.password == null");
    const user = await User.findOne({ _id: user_id, email }).exec();
    if(user === null)
        return fail(400, "no user with such credentials");
    const password_is_correct = await argon2.verify(user.password_hash, password);

    if(!password_is_correct)
        return fail(400, "no user with such credentials");

    let del_count = (await User.deleteOne({ email, password_hash: user.password_hash })).deletedCount;

    /* istanbul ignore next */
    if(del_count == 0)
        return fail(500, "internal server error");


    await Ingredient.deleteMany({ owner_id: user._id });
    await Dish.deleteMany({ owner_id: user._id });
    await Menu.deleteMany({ owner_id: user._id });
    await Category.deleteMany({ owner_id: user._id });

    res.status(200).send({ msg: "user deleted successfully" });
};

const getUser = async (req, res, next) => {
    const fail = failHandler(res, "failed to delete user: ");

    /* istanbul ignore next */
    if(req.body == null || req.body.jwt_payload == null)
        return fail(500, "internal server error");

    const _id = req.body.jwt_payload.user_id;
    
    const user = await User.findOne({ _id }).exec();
    /* istanbul ignore next */
    if(user === null)
        return fail(500, "internal server error");

    res.status(200).send({ _id: user._id, business_name: user.business_name, email: user.email, enabled_2fa: user.enable_2fa });
};

module.exports = { createUser, authenticateUser, deleteUser, getUser };
