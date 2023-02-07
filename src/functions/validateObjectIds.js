const validateObjectIds = async (arr, MongooseModel) => {
    let objids = [];
    let all_convertible_to_objid = objids.every(objid => {
        try {
            objids.push(ObjectId(objid));
            return true;
        } catch (e) {
            return false;
        }
    });

    
    if(!all_convertible_to_objid)
        return null;
    
    const existing_elems = await MongooseModel.find({ _id: { $in: objids } });

    let all_exist = all_convertible_to_objid && .length == objids.length;

    return all_exist ? objids : null;
};

module.exports = validateObjectIds;