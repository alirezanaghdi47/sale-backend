// libraries
const path = require("path");
const express = require("express");
const fs = require("fs");
const sharp = require('sharp');

// middlewares
const {upload} = require("../middlewares/upload.js");
const {requireAuth} = require("../middlewares/authentication.js");

// models
const Advertise = require("./../models/advertiseModel.js");

// utils
const {generateSort, slugify} = require("../utils/functions");

const router = express.Router();

router.post("/addMyAdvertise", [requireAuth, upload.array("gallery")], async (req, res) => {
    try {
        const {title, description, category, quality, price, latitude, longitude, city} = req.body;
        const {name, family, phoneNumber} = res.locals.user;

        if (!name || !family || !phoneNumber) {
            return res.status(200).json({message: "ابتدا حساب کاربری خود را تکمیل کنید", status: "failure"});
        }

        const galleryPath = [];

        for (let i = 0; i < req.files.length; i++) {
            const fileName = req.files[i].filename;
            const oldFilePath = req.files[i].path;
            const newFilePath = path.resolve("uploads", "advertise", fileName);

            await sharp(oldFilePath)
                .resize({width: 360, height: 360, fit: "cover"})
                .toFile(newFilePath);

            await fs.unlinkSync(oldFilePath);

            galleryPath.push(process.env.ASSET_URL + "/advertise/" + fileName);
        }

        const newMyAdvertise = new Advertise({
            slug: slugify(title, Date.now()),
            gallery: galleryPath,
            title,
            description,
            category,
            quality,
            price,
            latitude,
            longitude,
            city,
            userId: res.locals.user.id
        });
        await newMyAdvertise.save();

        res.status(200).json({message: "ثبت آگهی انجام شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.put("/editMyAdvertise", [requireAuth, upload.array("gallery")], async (req, res) => {
    try {
        const {slug, title, description, category, quality, price, latitude, longitude, city} = req.body;
        const {advertiseid} = req.headers;

        const myAdvertise = await Advertise.findOne({
            $and: [
                {_id: {$eq: advertiseid}},
                {userId: {$eq: res.locals.user.id}}
            ]
        });

        if (!myAdvertise) {
            return res.status(200).json({message: "آگهی با این مشخصات وجود ندارد", status: "failure"});
        }

        let galleryPath = myAdvertise.gallery;

        if (req.files.length > 0 && galleryPath.length > 0) {
            for (let i = 0; i < galleryPath.length; i++) {
                const fileName = path.basename(galleryPath[i]);
                const filePath = path.resolve("uploads", "advertise", fileName);

                if (fs.existsSync(filePath)) {
                    await fs.unlinkSync(filePath);
                }
            }

            galleryPath = [];
        }

        for (let i = 0; i < req.files.length; i++) {
            const fileName = req.files[i].filename;
            const oldFilePath = req.files[i].path;
            const newFilePath = path.resolve("uploads", "advertise", fileName);

            await sharp(oldFilePath)
                .resize({width: 360, height: 360, fit: "cover"})
                .toFile(newFilePath);

            await fs.unlinkSync(oldFilePath);

            galleryPath.push(process.env.ASSET_URL + "/advertise/" + fileName);
        }

        await Advertise.findOneAndUpdate(
            {_id: myAdvertise._id},
            {
                slug,
                gallery: galleryPath,
                title,
                description,
                category,
                quality,
                price,
                latitude,
                longitude,
                city,
            },
            {new: true}
        );

        res.status(200).json({message: "ویرایش آگهی انجام شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.get("/getAllMyAdvertise", requireAuth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            sort = "newest",
        } = req.query;

        const myAdvertisesTotalCount = await Advertise.find({
            userId: {$eq: res.locals.user.id}
        })
            .exec()

        const myAdvertisesData = await Advertise.find({
            userId: {$eq: res.locals.user.id}
        })
            .populate({path: "userId"})
            .sort(generateSort(sort))
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        res.status(200).json({data: myAdvertisesData, totalCount: myAdvertisesTotalCount.length, status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.get("/getMyAdvertise", requireAuth, async (req, res) => {
    try {
        const {advertiseid} = req.headers;

        const myAdvertise = await Advertise.findOne({
            $and: [
                {_id: {$eq: advertiseid}},
                {userId: {$eq: res.locals.user.id}}
            ]
        })
            .populate({path: "userId", match: {userId: {$eq: res.locals.user.id}}})
            .exec();

        if (!myAdvertise) {
            return res.status(200).json({message: "آگهی با این مشخصات وجود ندارد", status: "failure"});
        }

        res.status(200).json({data: myAdvertise, status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.delete("/deleteMyAdvertise", requireAuth, async (req, res) => {
    try {
        const {advertiseid} = req.headers;

        const myAdvertise = await Advertise.findOne({
            $and: [
                {_id: {$eq: advertiseid}},
                {userId: {$eq: res.locals.user.id}}
            ]
        });

        if (!myAdvertise) {
            return res.status(200).json({message: "آگهی با این مشخصات وجود ندارد", status: "failure"});
        }

        for (let i = 0; i < myAdvertise.gallery.length; i++) {
            const fileName = path.basename(myAdvertise.gallery[i]);
            const filePath = path.resolve("uploads", "advertise", fileName);

            if (fs.existsSync(filePath)) {
                await fs.unlinkSync(filePath);
            }
        }

        await Advertise.deleteOne({_id: myAdvertise?._id});

        res.status(200).json({message: "آگهی حذف شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;