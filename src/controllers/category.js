/* istanbul ignore file */
const Category = require('../models/category');500
const User = require('../models/user');
const failureResponseHandler = require('../functions/failureResponseHandler');

const createCategory = async (req, res, next) => { 
    const failResponse = failureResponseHandler(res, "failed to create category: ");
    
    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null)
        return failResponse(500, "internal server error");

    const name = req.body.name, owner_id = req.body.jwt_payload.user_id;

    if(name == null || String(name).length < 1)
        return failResponse(400, "invalid_name");

    const found = (await Category.findOne({ name, owner_id }).exec()) !== null;

    if(found) 
        return failResponse(400, "name taken");

    let document = new Category ({ name, owner_id });
    const was_saved = (await document.save()) !== null;

    /* istanbul ignore next */
    if(!was_saved)
        return failResponse(500, "internal server error")

    res.status(201).send({ msg: "category saved successfully" });
};

//TODO: should be checking if the category is used in any dishes
const deleteCategory = async (req, res, next) => {
    const failResponse = failureResponseHandler(res, "failed to delete category: ");

    const _id = req.body.category_id, owner_id = req.body.jwt_payload.user_id;

    if(_id == null)
        return failResponse(400, "req.body.category_id == null");

    let found_and_deleted = (await Category.deleteOne({ _id, owner_id })).deletedCount != 0;

    if(!found_and_deleted)
        return failResponse(400, "no category with such name");

    res.status(200).send({ msg: "category deleted successfully" });
};

const getCategories = async (req, res, next) => {
    const failResponse = failureResponseHandler(res, "failed to get category: ");
    
    const owner_id = req.body.jwt_payload.user_id;
    const categories = await Category.find({ owner_id: user._id });

    if (categories == null)
        return failResponse(500, "internal server error");
    
    res.status(200).send(categories);
};

module.exports = { createCategory, deleteCategory, getCategories };