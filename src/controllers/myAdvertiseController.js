// libraries
const path = require("path");
const express = require("express");

// middlewares
const {upload} = require("../middlewares/upload.js");
const {requireAuth} = require("../middlewares/authentication.js");

// models
const Advertise = require("./../models/advertiseModel.js");
const User = require("./../models/userModel.js");

// utils
const {generateSort, isValidObjectId, deleteFile} = require("../utils/functions");

const router = express.Router();

router.post("/addMyAdvertise", [requireAuth, upload("advertise").array("gallery")], async (req, res) => {
    try {
        const {title, description, category, quality, price, latitude, longitude, city} = req.body;

        const galleryPath = [];

        for (let i = 0; i < req.files.length; i++) {
            galleryPath.push(new URL(process.env.BASE_URL).origin.concat(path.join("/public" , "uploads" , "advertise" , req.files[i].filename)));
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

router.get("/getAllMyAdvertise", requireAuth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            sort = "newest",
        } = req.query;

        const MyAdvertiseTotalCount = await Advertise.find()
            .count();

        const myAdvertisesData = await Advertise.find()
            .populate({path: "userId", match: {_id: res.locals.user.id}})
            .sort(generateSort(sort))
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
            
        res.status(200).json({data: myAdvertisesData , totalCount: MyAdvertiseTotalCount, status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.delete("/deleteMyAdvertise", requireAuth, async (req, res) => {
    try {
        const {advertiseid} = req.headers;

        if (!isValidObjectId(advertiseid)) {
            return res.status(409).json({message: "فرمت id نادرست است", status: "failure"});
        }

        const myAdvertise = await Advertise.findById(advertiseid)

        if (!myAdvertise) {
            return res.status(409).json({message: "آگهی با این مشخصات وجود ندارد", status: "failure"});
        }

        for (let i = 0; i < myAdvertise.gallery.length; i++) {
            await deleteFile(path.join(process.cwd() , new URL(myAdvertise.gallery[i]).pathname));
        }

        await Advertise.deleteOne({_id: advertiseid});

        res.status(200).json({message: "آگهی حذف شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;