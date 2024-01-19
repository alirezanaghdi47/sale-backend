// libraries
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadsPath = path.join(process.cwd(), 'uploads');
            const advertisePath = path.join(process.cwd(), 'uploads' , 'advertise');
            const avatarPath = path.join(process.cwd(), 'uploads' , 'avatar');

            if (!fs.existsSync(uploadsPath)) {
                fs.mkdirSync(uploadsPath, { recursive: true });
            }

            if (!fs.existsSync(advertisePath)) {
                fs.mkdirSync(advertisePath, { recursive: true });
            }

            if (!fs.existsSync(avatarPath)) {
                fs.mkdirSync(avatarPath, { recursive: true });
            }

            cb(null, uploadsPath);
        },
        filename: (req, file, cb) => {
            const extArray = file.mimetype.split("/");
            const extension = extArray[extArray.length - 1];
            const time = Date.now();
            const filePath = path.parse(file.originalname).name + '-' + time + '.' + extension;

            cb(null, filePath);
        }
    })
});

module.exports = {
    upload
}