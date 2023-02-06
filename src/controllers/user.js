const User = require('../models/user');
const argon2 = require('argon2');
const Ingredient = require('../models/ingredient');
const Dish = require('../models/dish');
const failHandler = require('../functions/fail');

// POST /api/user => createUser
const createUser = async (req, res, next) => {
    const fail = failHandler(res, "failed to create user: ");

    if(req.body == null)
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
    res.status(201).send({ msg: "user saved successfully", id: document._id});
};

// DELETE /api/user => deleteUser
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
    const user = await User.findOne({ id: user_id, email }).exec();
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
    //Menu.deleteMany({ owner_id: user._id });
    //Category.deleteMany({ owner_id: user._id });

    res.status(200).send({ msg: "user deleted successfully" });
};

module.exports = { createUser, deleteUser };
