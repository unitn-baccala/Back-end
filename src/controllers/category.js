const Category = require('../models/category');500
const User = require('../models/user');
const failHandler = require('../functions/fail');

const createCategory = async (req, res, next) => { 
    const fail = failHandler(res, "failed to create category: ");
    
    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null) //this should never happen since the API requires token checking 
        return fail(500, "req.body == null || req.body.token == null");

    const name = req.body.name, owner_id = req.body.jwt_payload.user_id;

    if(name == null || String(name).length < 1)
        return fail(400, "invalid_name");

    const found = (await Category.findOne({ name, owner_id }).exec()) !== null;

    if(found) 
        return fail(400, "name taken");

    let document = new Category ({ name, owner_id });
    const was_saved = (await document.save()) !== null;

    /* istanbul ignore next */
    if(!was_saved)
        return fail(500, "internal server error")

    res.status(201).send({ msg: "category saved successfully" });
}

//TODO: should be checking if the category is used in any dishes
const deleteCategory = async (req, res, next) => {
    const fail = failHandler(res, "failed to delete category: ");
 
    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null) // the function is token checked so this cannot happen
        return fail(500, "req.body == null || req.body.token == null");
    
    const _id = req.body.category_id, owner_id = req.body.jwt_payload.user_id;

    if(_id == null)
        return fail(400, "req.body.category_id == null");

    let del_count = (await Category.deleteOne({ _id, owner_id })).deletedCount;
    if(del_count == 0)
        return fail(400, "no category with such name");

    res.status(200).send({ msg: "category deleted successfully" });
}

const getCategories = async (req, res, next) => {
    const fail = failHandler(res, "failed to get category: ");

    /* istanbul ignore next */
    if (req.query == null) //req.query can be empty but not null so this should not happen
        return fail(400, "no parameters");
    
    const business_name = req.query.business_name;
    if(business_name == null)
        return fail(400, "no business name specified");

    const user = await User.findOne({business_name});
    if(!user)
        return fail(400, "no such business name found");

    const categories = await Category.find({ owner_id: user._id });
    if (!categories)
        return fail(400, "no categories found");
    
    res.status(200).send(categories);
}

module.exports = { createCategory, deleteCategory, getCategories };