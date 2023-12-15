// libraries
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// models
const User = require("./../models/userModel.js");
const Session = require("./../models/sessionModel.js");

// middlewares
const {transporter} = require("../middlewares/sendEmail");
const {requireAuth} = require("../middlewares/authentication");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if (user) {
            return res.status(409).json({message: "کاربری با این مشخصات وجود دارد", status: "failure"});
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
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if (!user) {
            return res.status(409).json({message: "کاربری با این مشخصات وجود ندارد", status: "failure"});
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({message: "ایمیل یا رمز عبور نادرست است", status: "failure"});
        }

        const privateUser = {
            id: user._id,
            name: user.name,
            family: user.family,
            avatar: user.avatar,
            email: user.email,
            phoneNumber: user.phoneNumber,
            expire: Math.floor((Date.now() / 1000) + (24 * 60 * 60))
        };

        const token = jwt.sign({user: privateUser}, process.env.JWT_SECRET, {expiresIn: "1d"});

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
            return res.status(409).json({message: "کاربری با این مشخصات وجود ندارد", status: "failure"});
        }

        const newSession = new Session({
            status: 1,
            expire: Math.floor((Date.now() / 1000) + (24 * 60 * 60)),
            userId: user?._id,
        });
        await newSession.save();

        const privateUser = {
            id: user._id,
            name: user.name,
            family: user.family,
            avatar: user.avatar,
            email: user.email,
            phoneNumber: user.phoneNumber,
            expire: Math.floor((Date.now() / 1000) + (24 * 60 * 60))
        };

        const token = jwt.sign({user: privateUser}, process.env.JWT_SECRET, {expiresIn: "1d"});

        const mailOptions = {
            from: 'admin@mail.namagadget.ir',
            template: "forgetPassword",
            to: user.email,
            subject: 'فراموشی رمز عبور نما گجت',
            context: {
                name: user.name,
                link: 'کلیک کنید',
                href: `http://localhost:3000/auth/verify-password?token=${token}`,
            },
        };

        transporter.sendMail(mailOptions)
            .then(() => console.log(`email send to ${user.email}`))
            .catch(err => console.log(err));

        res.status(200).json({message: "ایمیل برای شما ارسال شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.post("/verifyPassword", requireAuth, async (req, res) => {
    try {
        const {newPassword} = req.body;

        const user = await User.findById(res.locals.user.id);

        if (!user) {
            return res.status(409).json({message: "کاربری با این مشخصات وجود ندارد", status: "failure"});
        }

        const session = await Session.findOne({
            $and: [
                {userId: {$eq: res.locals.user.id}},
                {status: {$eq: 1}},
                {expire: {$gt: Math.floor(Date.now() / 1000)}},
            ]
        });

        if (!session) {
            return res.status(409).json({message: "ایمیل فعالسازی معتبر نمی باشد", status: "failure"});
        }

        await User.findOneAndUpdate(
            {_id: user._id},
            {password: await bcrypt.hash(newPassword, 10)},
            {new: true}
        );

        await Session.deleteOne({_id: session._id});

        res.status(200).json({message: "رمز عبور تغییر کرد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;