// libraries
const path = require("path");
const express = require("express");
const bcrypt = require("bcrypt");

// middlewares
const {upload} = require("../middlewares/upload.js");
const {requireAuth} = require("../middlewares/authentication");

// models
const User = require("./../models/userModel.js");

const router = express.Router();

router.put("/editPassword", requireAuth, async (req, res) => {
    try {
        const {oldPassword, newPassword} = req.body;

        const isEqualPassword = await bcrypt.compare(newPassword, user.password);

        if (isEqualPassword) {
            return res.status(400).json({error: "رمز عبور تکراری می باشد", status: "failure"});
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
        const {name, family, email, phoneNumber, birthDay} = req.body;

        const avatarPath = path.join(path.resolve("public"), "uploads", req.file.filename);

        await User.findOneAndUpdate(
            {_id: res.locals.user.id},
            {
                avatar: avatarPath,
                name,
                family,
                email,
                phoneNumber,
                birthDay
            },
            {new: true}
        );

        res.status(200).json({message: "پروفایل اصلاح شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;