// libraries
const ObjectId = require('mongoose').Types.ObjectId;

const generateSort = (sort) => {
    switch (sort) {
        case "newest":
            return {createdAt: -1};
        case "expensive":
            return {price: -1};
        default:
            return null;
    }
}

const isValidObjectId = (id) => {

    if (ObjectId.isValid(id)) {
        if ((String)(new ObjectId(id)) === id)
            return true;
        return false;
    }
    return false;
}

module.exports = {
    generateSort,
    isValidObjectId
}
