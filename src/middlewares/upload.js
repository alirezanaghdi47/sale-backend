// libraries
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        cb(null, path.parse(file.originalname).name + '-' + Date.now()+ '.' +extension)
    }
});

const upload = multer({storage});

module.exports = {
    upload
}