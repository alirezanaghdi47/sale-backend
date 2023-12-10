// libraries
const path = require("path");
const express = require("express");
const fs = require("fs");
const sharp = require('sharp');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// middlewares
const {upload} = require("../middlewares/upload.js");
const {requireAuth} = require("../middlewares/authentication");

// models
const User = require("./../models/userModel.js");

// utils
const {deleteFile} = require("../utils/functions");

const router = express.Router();

router.put("/editPassword", requireAuth, async (req, res) => {
    try {
        const {oldPassword, newPassword} = req.body;

        const user = await User.findById(res.locals.user.id);

        const isEqualPassword = await bcrypt.compare(newPassword, user.password);

        if (isEqualPassword) {
            return res.status(400).json({message: "رمز عبور تکراری می باشد", status: "failure"});
        }

        await User.findByIdAndUpdate(
            {_id: res.locals.user.id},
            {password: await bcrypt.hash(newPassword, 10)},
            {new: true}
        );

        res.status(200).json({message: "رمز عبور اصلاح شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.put("/editProfile", [requireAuth, upload("user").single("avatar")], async (req, res) => {
    try {
        const {name, family , phoneNumber} = req.body;

        const user = await User.findById(res.locals.user.id);

        let avatarPath = user.avatar;

        if (req.file) {
            const fileName = `compressed-${req.file.filename.replace(path.extname(req.file.filename) , ".webp")}`;
            await sharp(req.file.path)
                .toFormat("webp")
                .resize({width: 120, height: 120 , fit: "cover"})
                .toFile(path.resolve("public", "uploads", "user", fileName))
            avatarPath = new URL(process.env.BASE_URL).origin.concat(path.join("/public" , "uploads" , "user" , fileName));
            await fs.unlinkSync(req.file.path);
        }

        if(req.file && user.avatar){
            await deleteFile(path.join(process.cwd() , new URL(user.avatar).pathname));
        }

        await User.findOneAndUpdate(
            {_id: res.locals.user.id},
            {
                avatar: avatarPath,
                name,
                family,
                phoneNumber,
            },
            {new: true}
        );

        const privateUser = {
            avatar: avatarPath,
            name: name ?? user.name,
            family: family ?? user.family,
            phoneNumber: phoneNumber ?? user.phoneNumber,
        };

        res.status(200).json({data: privateUser , message: "پروفایل اصلاح شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;