// libraries
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// models
const User = require("./../models/userModel.js");

// middlewares
const limiter = require("../middlewares/rateLimit");

const router = express.Router();

router.post("/register", limiter, async (req, res) => {
    try {
        const {phoneNumber, password} = req.body;

        if (req.rateLimit.remaining === 0) {
            return res.status(200).json({
                message: "شما تنها قادر به ارسال 10 درخواست در دقیقه هستید",
                status: "failure"
            });
        }

        const user = await User.findOne({phoneNumber});

        if (user) {
            return res.status(200).json({message: "کاربری با این مشخصات وجود دارد", status: "failure"});
        }

        const newUser = new User({
            phoneNumber,
            password: await bcrypt.hash(password, 10),
        });
        await newUser.save();

        res.status(200).json({message: "عضویت با موفقیت انجام شد", status: "success"});
    } catch (err) {
        if (err.code === 11000) {
            return res.status(200).json({message: "کاربری با این شماره همراه وجود دارد", status: "failure"});
        }

        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.post("/login", limiter, async (req, res) => {
    try {
        const {phoneNumber, password} = req.body;

        if (req.rateLimit.remaining === 0) {
            return res.status(200).json({
                message: "شما تنها قادر به ارسال 10 درخواست در دقیقه هستید",
                status: "failure"
            });
        }

        const user = await User.findOne({phoneNumber});

        if (!user) {
            return res.status(200).json({message: "کاربری با این مشخصات وجود ندارد", status: "failure"});
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(200).json({message: "شماره همراه یا رمز عبور نادرست است", status: "failure"});
        }

        const privateUser = {
            id: user._id,
            name: user.name,
            family: user.family,
            avatar: user.avatar,
            phoneNumber: user.phoneNumber,
            age: user.age,
        };

        const token = jwt.sign({user: privateUser}, process.env.JWT_SECRET, {expiresIn: "1d"});

        res.status(200).json({token, message: "خوش آمدید", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;