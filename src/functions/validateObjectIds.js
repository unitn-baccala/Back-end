const ObjectId = require('mongoose').Types.ObjectId;

const validateObjectIds = async (arr, MongooseModel) => {
    if (arr == null) 
        return [];
    let objids = [];
    
    if(!Array.isArray(arr))
        return null;

    for(let i = 0; i < arr.length; i++) {
        try{
            objids.push(ObjectId(arr[i]));
        } catch(e) {}
    }
    const all_converted_to_objid = objids.length == arr.length;

    if(!all_converted_to_objid)
        return null;
    
    const existing_elems = await MongooseModel.find({ _id: { $in: objids } }).exec();

    let all_exist = existing_elems.length == objids.length;

    if(!all_exist)
        return null;
    
    return objids;
};

module.exports = validateObjectIds;