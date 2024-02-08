// libraries
const path = require("path");
const express = require("express");
const fs = require("fs");
const sharp = require('sharp');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// middlewares
const {upload} = require("../middlewares/upload.js");
const {requireAuth} = require("../middlewares/authentication");

// models
const User = require("./../models/userModel.js");

const router = express.Router();

router.put("/editPassword", requireAuth, async (req, res) => {
    try {
        const {oldPassword, newPassword} = req.body;

        const user = await User.findById(res.locals.user.id);

        const isEqualPassword = await bcrypt.compare(newPassword, user.password);

        if (isEqualPassword) {
            return res.status(200).json({message: "رمز عبور تکراری می باشد", status: "failure"});
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

router.put("/editProfile", [requireAuth, upload.single("avatar")], async (req, res) => {
    try {
        const {name, family, age, preview} = req.body;

        const user = await User.findById(res.locals.user.id);

        console.log(user);

        let avatarPath = preview === "null" ? null : preview;

        if (req.file) {

            if (avatarPath !== null) {
                const fileName = path.basename(avatarPath);
                const filePath = path.resolve("uploads" , "avatar" , fileName);

                if (fs.existsSync(filePath)){
                    await fs.unlinkSync(filePath);
                }
            }

            const fileName = req.file.filename;
            const oldFilePath = req.file.path;
            const newFilePath = path.resolve("uploads" , "avatar", fileName);

            await sharp(oldFilePath)
                .resize({width: 240, height: 240, fit: "cover"})
                .toFile(newFilePath);

            await fs.unlinkSync(oldFilePath);

            avatarPath = process.env.ASSET_URL + "/avatar/" + fileName;
        }

        await User.findOneAndUpdate(
            {_id: res.locals.user.id},
            {
                avatar: avatarPath,
                name,
                family,
                age,
            },
            {new: true}
        );

        const privateUser = {
            id: user._id,
            avatar: avatarPath,
            name: name ?? user.name,
            family: family ?? user.family,
            phoneNumber: user.phoneNumber,
            age: age ?? user.age,
        };

        const token = jwt.sign({user: privateUser}, process.env.JWT_SECRET, {expiresIn: "1d"});

        res.status(200).json({token, message: "پروفایل اصلاح شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;