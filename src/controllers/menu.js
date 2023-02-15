/* istanbul ignore file */
const Menu = require('../models/menu')
const Dish = require('../models/dish');
const User = require('../models/user')
const ObjectId = require('mongoose').Types.ObjectId;
const failHandler = require('../functions/failureResponseHandler');
const validateObjectIds = require('../functions/validateObjectIds');
const currentTime = require('../functions/currentTime');

const createMenu = async (req, res, next) => {
    const fail = failHandler(res, "failed to create menu: ");

    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null) //this should never happen since the API requires token checking 
        return fail(500, "internal server error")

    const owner_id = req.body.jwt_payload.user_id, name = req.body.name;
    const raw_dishes = req.body.dishes, start_time = req.body.start_time, end_time = req.body.end_time;

    if (name == null || String(name).length < 1)
        return fail(400, "invalid name");

    if (raw_dishes != null && !Array.isArray(raw_dishes))
        return fail(400, "invalid 'dishes' parameter");
    
    
    if(start_time != null && start_time.hour != null && start_time.minute != null)
        return fail(400, "invalid 'start_time' parameter");

    if(end_time != null && end_time.hour != null && end_time.minute != null)
        return fail(400, "invalid 'end_time' parameter");

    const found = (await Menu.findOne({ owner_id, name }).exec()) !== null;

    if (found)
        return fail(400, "name taken");

    let dishes = validateObjectIds(raw_dishes, Dish);

    if (dishes == null)
        return fail(400, "some dishes do not exist");


    const document = new Menu({ owner_id, name, dishes, start_time, end_time });

    const was_saved = (await document.save()) !== null;
    /* istanbul ignore next */
    if (!was_saved)
        return fail(500, "internal server error");
    res.status(201).send({ msg: "menu saved successfully", id: document._id });
}

const deleteMenu = async (req, res, next) => {
    const fail = failHandler(res, "failed to delete menu: ");

    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null) //this should never happen since the API requires token checking 
        return fail(500, "internal server error");

    const _id = req.body.menu_id, owner_id = req.body.jwt_payload.user_id;

    if (_id == null)
        return fail(400, "req.body.menu_id == null");

    let del_count = (await Menu.deleteOne({ owner_id, _id })).deletedCount;

    if (del_count == 0)
        return fail(400, "no menu with such name");

    res.status(200).send({ msg: "menu deleted successfully" });
}

const getMenus = async (req, res, next) => {
    const fail = failHandler(res, "failed to get menus: ");

    /* istanbul ignore next */
    if (req.body == null || req.body.jwt_payload == null) //this should never happen since the API requires token checking 
        return fail(500, "internal server error");

    const owner_id = req.body.jwt_payload.user_id;


    const menus = await Menu.find({ owner_id });

    if (menus == null)
        return fail(500, "internal server error");

    res.status(200).send(menus);
}

const getFullMenu = async (req, res, next) => {
    const fail = failHandler(res, "failed to get menus: ");

    if (req.query == null)
        return fail(500, "internal server error");

    const business_name = req.query.business_name;

    if (business_name == null)
        return fail(400, "no business name specified");

    const current_time = currentTime();
    const full_menu_array = await User.aggregate([
        { // filter out other businesses
            $match: {
                business_name,
            },
        },
        { // remove sensitive data
            $project: {
                email: 0,
                password_hash: 0,
                enable_2fa: 0,
                //only _id and business_name remain
            },
        },
        { // fill categories array with category subdocuments
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
        },
        { // fill menus array with menu subdocuments
            $lookup: {
                from: "menus",
                localField: "_id",
                foreignField: "owner_id",
                as: "menu",
                pipeline: [
                    {
                        $match: {
                            start_time: {
                                $lte: current_time
                            },
                            end_time: {
                                $gt: current_time
                            }
                        }
                    },
                    {
                        $limit: 1
                    },
                    { // fill dishes array with dish subdocuments instead of '_id's
                        $lookup: {
                            from: "dishes",
                            localField: "dishes",
                            foreignField: "_id",
                            as: "dishes",
                            pipeline: [
                                { // fill ingredients array with ingredient subdocuments instead of '_id's
                                    $lookup: {
                                        from: "ingredients",
                                        localField: "ingredients",
                                        foreignField: "_id",
                                        as: "ingredients",
                                        pipeline: [
                                            {
                                                $project: { owner_id: 0 }
                                            },
                                        ],
                                    },
                                },
                                { // fill categories array with category subdocuments instead of '_id's
                                    $lookup: {
                                        from: "categories",
                                        localField: "categories",
                                        foreignField: "_id",
                                        as: "categories",
                                        pipeline: [
                                            {
                                                $project: { owner_id: 0 }
                                            },
                                        ],
                                    },
                                },
                                {
                                    $project: { owner_id: 0 }
                                },
                            ],
                        },
                    },
                    {
                        $project: { owner_id: 0 }
                    },
                ],
            },
        },
        {
            $unwind: "$menu"
        },
    ]).exec();

    if (full_menu_array == null)
        return fail(500, "internal server error");

    if (full_menu_array[0] == null)
        return fail(400, "no menu currently active");

    res.status(200).send(full_menu_array[0]);
}

module.exports = { createMenu, deleteMenu, getMenus, getFullMenu };