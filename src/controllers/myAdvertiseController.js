// libraries
const path = require("path");
const express = require("express");

// middlewares
const {upload} = require("../middlewares/upload.js");
const {requireAuth} = require("../middlewares/authentication.js");

// models
const Advertise = require("./../models/advertiseModel.js");

// utils
const {generateSort} = require("../utils/functions");

const router = express.Router();

router.post("/", [requireAuth, upload.array("gallery")], async (req, res) => {
    try {
        const {title, description, category, quality, price, latitude, longitude, city} = req.body;

        const galleryPath = [];

        for (let i = 0; i < req.files.length; i++) {
            galleryPath.push(path.join(path.resolve("public"), "uploads", req.files[i].filename));
        }

        const newMyAdvertise = new Advertise({
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

router.get("/" ,requireAuth, async (req, res) => {
    try {
        const {page = 1, limit = 12, sort = "newest"} = req.query;

        const myAdvertises = await Advertise.find({})
            .populate({path: "userId" , match: {_id: res.locals.user.id}})
            .sort(generateSort(sort))
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        res.status(200).json({data: myAdvertises, status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;