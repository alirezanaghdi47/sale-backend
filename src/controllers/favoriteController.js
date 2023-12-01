// libraries
const express = require("express");

// middlewares
const {requireAuth} = require("../middlewares/authentication.js");

// models
const Favorite = require("./../models/favoriteModel.js");
const Advertise = require("./../models/advertiseModel.js");

// utils
const {generatePopulateSort, isValidObjectId, generateSort} = require("../utils/functions");

const router = express.Router();

router.post("/addFavorite", requireAuth, async (req, res) => {
    try {
        const {advertiseid} = req.headers;

        const newFavorite = new Favorite({
            advertiseId: advertiseid,
            userId: res.locals.user.id
        });
        await newFavorite.save();

        res.status(200).json({message: "آگهی مورد علاقه اضافه شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.get("/getAllFavorite", requireAuth, async (req, res) => {
    try {

        const {
            page = 1,
            limit = 12,
            sort = "newest"
        } = req.query;

        const favorites = await Favorite.find({
            userId: {$eq: res.locals.user.id}
        })
            .select("advertiseId")
            .exec();

        const ids = await favorites.map(favorite => favorite?.advertiseId.toString());

        const advertises = await Advertise.find()
            .where('_id')
            .in(ids)
            .sort(generateSort(sort))
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        res.status(200).json({data: advertises , totalCount: ids.length, status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.get("/getIsMyFavorite", requireAuth, async (req, res) => {
    try {
        const {advertiseid} = req.headers;

        const favorite = await Favorite.findOne({
            $and: [
                {userId: {$eq: res.locals.user.id}},
                {advertiseId: {$eq: advertiseid}}
            ]
        }).exec();
    
        res.status(200).json({data: Boolean(favorite), status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.delete("/deleteFavorite", requireAuth, async (req, res) => {
    try {
        const {advertiseid} = req.headers;

        if (!isValidObjectId(advertiseid)) {
            return res.status(409).json({message: "فرمت id نادرست است", status: "failure"});
        }

        const favorite = await Favorite.findOne({
            $and: [
                 {userId: {$eq: res.locals.user.id}},
                 {advertiseId: {$eq: advertiseid}}
            ]
    
        });    

        if (!favorite) {
            return res.status(409).json({message: "علاقه مندی با این مشخصات وجود ندارد", status: "failure"});
        }

        await Favorite.deleteOne({_id: favorite._id });

        res.status(200).json({message: "آگهی مورد علاقه حذف شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;