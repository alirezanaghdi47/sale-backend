// libraries
const express = require("express");

// models
const Advertise = require("./../models/advertiseModel.js");

// utils
const {generateSort} = require("../utils/functions");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const {page = 1, limit = 12, search = "", sort = "newest", categories, startPrice = 0, endPrice = 1000000000, cities} = req.query;

        const advertises = await Advertise.find({
            $and: [
                {title: {$regex: search , $options: "i"}},
                {price: {$gt: startPrice}},
                {price: {$lt: endPrice}},
                // {category: {$eq: categories}},
                // {city: {$eq: cities}}
            ]
        })
            .limit(limit)
            .sort(generateSort(sort))
            .skip((page - 1) * limit)
            .exec();

        res.status(200).json({data: advertises, status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.get("/:id", async (req, res) => {
    try {
        const {id} = req.params;

        const advertise = await Advertise.findById(id).exec();

        res.status(200).json({data: advertise, status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;