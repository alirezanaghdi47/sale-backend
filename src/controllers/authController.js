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

        const user = await User.findOne({email: {$eq: email}});

        if (user) {
            return res.status(409).json({message: "کاربری با این مشخصات وجود دارد", status: "failure"});
        }

        const newUser = new User({
            email,
            password: await bcrypt.hash(password, 10),
        });
        await newUser.save();

        const newSession = new Session({
            status: 0,
            code: Math.floor(100000 + Math.random() * 900000),
            expire: Math.floor((Date.now() / 1000) + (15 * 60)),
            userId: newUser?._id,
        });
        await newSession.save();

        const mailOptions = {
            from: 'namagadget@mail.namagadget.ir',
            template: "register",
            to: newUser?.email,
            subject: 'عضویت نما گجت',
            context: {
                code: newSession?.code
            },
        };

        transporter.sendMail(mailOptions)
            .then(() => console.log(`email send to ${newUser?.email}`))
            .catch(err => console.log(err));

        res.status(200).json({message: "ایمیل تکمیل عضویت برای شما ارسال شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.post("/confirmRegister", async (req, res) => {
    try {
        const {email , code} = req.body;

        const user = await User.findOne({email: {$eq: email}});

        if (!user) {
            return res.status(409).json({message: "کاربری با این مشخصات وجود ندارد", status: "failure"});
        }

        const session = await Session.findOne({
            $and: [
                {userId: {$eq: user?._id}},
                {status: {$eq: 0}},
                {code: {$eq: code}},
                {expire: {$gt: Math.floor(Date.now() / 1000)}},
            ]
        });

        if (!session) {
            return res.status(409).json({message: "اطلاعات معتبر نمی باشد", status: "failure"});
        }

        await User.findOneAndUpdate(
            {_id: user._id},
            {status: 1},
            {new: true}
        );

        await Session.deleteOne({_id: session._id});

        res.status(200).json({message: "عضویت با موفقیت انجام شد", status: "success"});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({
            $and:[
                {email: {$eq: email}},
                {status: {$eq: 1}},
            ]
        });

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
            expire: Math.floor((Date.now() / 1000) + (5 * 60)),
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
            from: 'namagadget@mail.namagadget.ir',
            template: "forgetPassword",
            to: user.email,
            subject: 'فراموشی رمز عبور نما گجت',
            context: {
                name: user.name,
                link: 'کلیک کنید',
                href: `${process.env.ORIGIN}/auth/verify-password?token=${token}`,
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