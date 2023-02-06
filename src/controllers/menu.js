const Menu = require('../models/menu')
const Dish = require('../models/dish');
const ObjectId = require('mongoose').Types.ObjectId;
// POST /menu => createMenu
const createMenu = async (req, res, next) => {
    const fail = (code, msg) => {
        res.status(code).send({msg: "failed to create menu: " + msg});
    };

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
    res.status(201).send({ msg: "menu saved successfully" });
}

const deleteMenu = async (req, res, next) => {
    const fail = (code, msg) => {
        res.status(code).send({msg: "failed to delete menu: " + msg});
    };

    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null) //this should never happen since the API requires token checking 
        return fail(400, "req.body == null || req.body.token == null");

    const name = req.body.name, owner_id = req.body.jwt_payload.user_id;

    if(name == null)
        return fail(400, "req.body.name == null");

    let del_count = (await Menu.deleteOne({ owner_id, name })).deletedCount;

    if(del_count == 0)
        return fail(400, "no menu with such name");

    res.status(200).send({ msg: "menu deleted successfully" });
}

const getMenues = async (req, res, next) => {
    if (req.query == null) {
        res.status(400).send({ msg: "no parameters"});
        return;
    }
    
    const business_name = req.query.business_name;

    if(business_name == null)
        res.status(400).send({ msg: "no business name specified" });
    else {
        const user = await User.findOne({business_name});
        if(!user) {
            res.status(400).send({ msg: "no such business name found" });
            return;
        }

        const dishes = await Dish.find({ owner_id: user._id });

        if (dishes) {
            res.status(200).send(dishes);
        } else {
            res.status(400).send({ msg: "no dishes found" });
        }
    }
}

module.exports = { createMenu, deleteMenu };