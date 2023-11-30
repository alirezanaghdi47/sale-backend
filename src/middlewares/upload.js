// libraries
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const upload = (folderName) => {
    return multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = path.resolve(__dirname, '../..', 'public/uploads' , folderName);
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
            
                cb(null, uploadPath);
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