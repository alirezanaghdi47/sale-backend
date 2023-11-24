// libraries
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const upload = (folderName) => {
    return multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                const path = `./public/uploads/${folderName}`;
                if (!fs.existsSync(path)) {
                    fs.mkdirSync(path, { recursive: true });
                }
                cb(null, path);
            },
            filename: (req, file, cb) => {
                let extArray = file.mimetype.split("/");
                let extension = extArray[extArray.length - 1];
                cb(null, path.parse(file.originalname).name + '-' + Date.now() + '.' + extension)
            }
        })
    })
}

module.exports = {
    upload
}