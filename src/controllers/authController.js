// libraries
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// models
const User = require("./../models/userModel.js");
const Log = require("./../models/logModel.js");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if (user) {
            return res.status(409).json({error: "کاربری با این مشخصات وجود دارد", status: "failure"});
        }

        const newUser = new User({
            email,
            password: await bcrypt.hash(password, 10),
        });
        await newUser.save();

        res.status(200).json({message: "ثبت نام انجام شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.post("/login", async (req, res) => {
    try {
        const {email, password, platform, browser, country, city} = req.body;

        const user = await User.findOne({email});

        if (!user) {
            return res.status(409).json({error: "کاربری با این مشخصات وجود ندارد", status: "failure"});
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({message: "ایمیل یا رمز عبور نادرست است", status: "failure"});
        }

        const token = jwt.sign({
            user: {
                id: user._id,
                name: user.name,
                family: user.family,
                avatar: user.avatar,
                email: user.email,
                phoneNumber: user.phoneNumber,
                birthDay: user.birthDay,
            }
        }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        const newLog = new Log({
            platform,
            browser,
            country,
            city,
            userId: user._id
        });

        await newLog.save();

        res.status(200).json({token, message: "خوش آمدید", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.post("/forgetPassword", async (req, res) => {
    try {
        const {email} = req.body;

        const user = await User.findOne({email});

        if (!user) {
            return res.status(409).json({error: "کاربری با این مشخصات وجود ندارد", status: "failure"});
        }

        res.status(200).json({message: "ایمیل برای شما ارسال شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

// router.post("/verifyPassword", async (req, res) => {
//     try {
//
//     } catch (err) {
//         res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
//     }
// });

module.exports = router;