/* istanbul ignore file */
const Menu = require('../models/menu');
const Dish = require('../models/dish');
const User = require('../models/user');
const ObjectId = require('mongoose').Types.ObjectId;
const failureResponseHandler = require('../functions/failureResponseHandler');
const validateObjectIds = require('../functions/validateObjectIds');
const currentTime = require('../functions/currentTime');

const createMenu = async (req, res, next) => {
    const failResponse = failureResponseHandler(res, "failed to create menu: ");

    const owner_id = req.body.jwt_payload.user_id, name = req.body.name;
    const start_time = req.body.start_time, end_time = req.body.end_time;
    const unvalidated_dish_ids = req.body.dishes;

    if (name == null || String(name).length < 1)
        return failResponse(400, "invalid name");
    if(!Number.isInteger(start_time))
        return failResponse(400, "invalid 'start_time' parameter");
    if(!Number.isInteger(end_time))
        return failResponse(400, "invalid 'end_time' parameter");
    if(start_time >= end_time) 
        return failResponse(400, "start_time >= end_time");

    const dishes = await validateObjectIds(unvalidated_dish_ids, Dish);

    if (dishes == null)
        return failResponse(400, "invalid 'dishes' parameter");

    const found = (await Menu.findOne({ owner_id, name }).exec()) !== null;

    if (found)
        return failResponse(400, "name taken");

    const document = new Menu({ owner_id, name, dishes, start_time, end_time });
    const was_saved = (await document.save()) !== null;

    /* istanbul ignore next */
    if (!was_saved)
        return failResponse(500, "internal server error");
    
    res.status(201).send({ msg: "menu saved successfully", id: document._id });
};

const deleteMenu = async (req, res, next) => {
    const failResponse = failureResponseHandler(res, "failed to delete menu: ");

    const _id = req.body.menu_id, owner_id = req.body.jwt_payload.user_id;

    if (_id == null)
        return failResponse(400, "req.body.menu_id == null");

    const found_and_deleted = (await Menu.deleteOne({ owner_id, _id })).deletedCount != 0;

    if (!found_and_deleted)
        return failResponse(400, "no menu with such name");

    res.status(200).send({ msg: "menu deleted successfully" });
};

const getMenus = async (req, res, next) => {
    const failResponse = failureResponseHandler(res, "failed to get menus: ");

    const owner_id = req.body.jwt_payload.user_id;
    const menus = await Menu.find({ owner_id });

    if (menus == null)
        return failResponse(500, "internal server error");

    res.status(200).send(menus);
};

const getFullActiveMenuPipeline = (business_name, current_time) => [
    { // filter out other businesses
        $match: {
            business_name,
        },
    }, { // remove sensitive data (only _id and business_name remain)
        $project: {
            email: 0,
            password_hash: 0,
            enable_2fa: 0,
        },
    }, { // create and fill categories array with category subdocuments
        $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "owner_id",
            as: "categories",
            pipeline: [
                { // remove redundant owner_id
                    $project: { owner_id: 0 },
                },
            ],
        },
    }, { // fill menu array with a menu subdocument for the active menu
        $lookup: {
            from: "menus",
            localField: "_id",
            foreignField: "owner_id",
            as: "menu",
            pipeline: [
                { // only match active menu(s)
                    $match: {
                        start_time: { $lte: current_time },
                        end_time: { $gt: current_time },
                    }
                }, { // only return 1 menu
                    $limit: 1
                }, { // fill dishes array with subdocs instead of '_id's
                    $lookup: {
                        from: "dishes",
                        localField: "dishes",
                        foreignField: "_id",
                        as: "dishes",
                        pipeline: [
                            { // fill ingredients array with subdocs instead of '_id's
                                $lookup: {
                                    from: "ingredients",
                                    localField: "ingredients",
                                    foreignField: "_id",
                                    as: "ingredients",
                                    pipeline: [
                                        { // remove redundant owner_id
                                            $project: { owner_id: 0 }
                                        },
                                    ],
                                },
                            }, { // fill categories array with subdocs instead of '_id's
                                $lookup: {
                                    from: "categories",
                                    localField: "categories",
                                    foreignField: "_id",
                                    as: "categories",
                                    pipeline: [
                                        { // remove redundant owner_id
                                            $project: { owner_id: 0 }
                                        },
                                    ],
                                },
                            }, { // remove redundant owner_id
                                $project: { owner_id: 0 }
                            },
                        ],
                    },
                }, { // remove redundant owner_id
                    $project: { owner_id: 0 }
                },
            ],
        },
    }, { // turn the menu array containing only the active menu into a single menu object
        $unwind: "$menu"
    },
];

const getFullMenu = async (req, res, next) => {
    const failResponse = failureResponseHandler(res, "failed to get full active menu: ");

    const business_name = req.query.business_name;

    if (business_name == null)
        return failResponse(400, "no business name specified");

    const full_active_menu_pipeline = 
        getFullActiveMenuPipeline(business_name, currentTime());
    const full_menu_array = 
        await User.aggregate(full_active_menu_pipeline).exec();

    if (full_menu_array == null)
        return failResponse(500, "internal server error");
    if (full_menu_array[0] == null)
        return failResponse(400, "no menu currently active");

    res.status(200).send(full_menu_array[0]);
};

module.exports = { createMenu, deleteMenu, getMenus, getFullMenu };