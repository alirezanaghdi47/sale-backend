// libraries
const express = require("express");

// models
const Advertise = require("./../models/advertiseModel.js");

// utils
const {generateSort} = require("../utils/functions");
const {categories, cities} = require("../utils/constants");

const router = express.Router();

router.get("/getAllAdvertise", async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            sort = "newest",
            search = "",
            startPrice = 0,
            endPrice = 1000000000,
            category = categories,
            city = cities
        } = req.query;

        const advertises = await Advertise.find({
            $and: [
                {title: {$regex: search, $options: "i"}},
                {price: {$gt: startPrice}},
                {price: {$lt: endPrice}},
                {category: {$in: category}},
                {city: {$in: city}}
            ]
        })
            .sort(generateSort(sort))
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        res.status(200).json({data: advertises, status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.get("/getRelativeAdvertise", async (req, res) => {
    try {

        const {advertiseid} = req.headers;

        const advertise = await Advertise.findById(advertiseid);

        if (!advertise){
            return res.status(409).json({error: "آگهی با این مشخصات وجود ندارد", status: "failure"});
        }

        const relativeAdvertises = await Advertise.find({
            $and: [
                {_id: {$ne: advertise._id}},
                {category: {$eq: advertise.category}},
                {city: {$eq: advertise.city}},
                {status: {$ne: "sold"}}
            ]
        })
            .limit(6)
            .sort({createdAt: -1})
            .exec();

        res.status(200).json({data: relativeAdvertises, status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.get("/getAdvertise", async (req, res) => {
    try {
        const {advertiseid} = req.headers;

        const advertise = await Advertise.findById(advertiseid).exec();

        res.status(200).json({data: advertise, status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;