/* istanbul ignore file */
const Menu = require('../models/menu')
const Dish = require('../models/dish');
const User = require('../models/user')
const ObjectId = require('mongoose').Types.ObjectId;
const failHandler = require('../functions/fail');

const createMenu = async (req, res, next) => {
    const fail = failHandler(res, "failed to create menu: ");

    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null) //this should never happen since the API requires token checking 
        return fail(400, "req.body == null || req.token == null")
        
    const owner_id = req.body.jwt_payload.user_id, name = req.body.name;
    const dishes = req.body.dishes;

    if(name == null || String(name).length < 1)
        return fail(400, "invalid name");

    if(dishes != null && !Array.isArray(dishes))
        return fail(400, "failed to create menu: invalid 'dishes' parameter" );

    const found = (await Menu.findOne({ owner_id, name }).exec()) !== null;

    if(found)
        return fail(400, "name taken");
 
    let dishes_objid = [];
    let all_dishes_exist = dishes.every(dish => {
        try {
            dishes_objid.push(ObjectId(dish));
            return true;
        } catch(e) {
            return false;
        }
    });

    all_dishes_exist = all_dishes_exist && (await Dish.find({ _id: { $in: dishes_objid } })).length == dishes.length;
    
    if(!all_dishes_exist)
        return fail(400, "some dishes do not exist");


    const document = new Menu({ owner_id, name, dishes }); //implementare tutti i controlli sulle categorie

    const was_saved = (await document.save()) !== null;
    /* istanbul ignore next */
    if(!was_saved)
        return fail(500, "internal server error");
    res.status(201).send({ msg: "menu saved successfully", id: document._id });
}

const deleteMenu = async (req, res, next) => {
    const fail = failHandler(res, "failed to delete menu: ");

    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null) //this should never happen since the API requires token checking 
        return fail(400, "req.body == null || req.body.token == null");

    const _id = req.body.menu_id, owner_id = req.body.jwt_payload.user_id;

    if(_id == null)
        return fail(400, "req.body.name == null");

    let del_count = (await Menu.deleteOne({ owner_id, _id })).deletedCount;

    if(del_count == 0)
        return fail(400, "no menu with such name");

    res.status(200).send({ msg: "menu deleted successfully" });
}

const getMenus = async (req, res, next) => {
    const fail = failHandler(res, "failed to get menus: ");

    if (req.query == null) {
        return fail(400, "no parameters");
    }
    
    const business_name = req.query.business_name;

    if(business_name == null)
        return fail(400, "no business name specified");
    else {
        const user = await User.findOne({business_name});
        if(!user) {
            return fail(400, "no such business name found");
        }

        const menus = await Menu.find({ owner_id: user._id });

        if (menus) {
            res.status(200).send(menus);
        } else {
            return fail(400, "no dishes found");
        }
    }
}

module.exports = { createMenu, deleteMenu, getMenues: getMenus };