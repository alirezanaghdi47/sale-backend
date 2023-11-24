// libraries
const fs = require("fs");
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

const generatePopulateSort = (sort) => {
    switch (sort) {
        case "newest":
            return {createdAt: {$eq: -1}};
        case "expensive":
            return {price: {$eq: -1}};
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

const deleteFile = (path) => {
    fs.access(path, (error) => {
        if (error) return;
        fs.unlink(path, (error) => {
            if (error) return;
        })
    });
}

module.exports = {
    generateSort,
    generatePopulateSort,
    isValidObjectId,
    deleteFile
}
