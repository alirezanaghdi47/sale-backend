// libraries
const express = require("express");

// middlewares
const {requireAuth} = require("../middlewares/authentication.js");

// models
const Favorite = require("./../models/favoriteModel.js");

// utils
const {generateSort, isValidObjectId} = require("../utils/functions");

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
    try {
        const {advertiseId} = req.body;

        const newFavorite = new Favorite({
            advertiseId: advertiseId,
            userId: res.locals.user.id
        });
        await newFavorite.save();

        res.status(200).json({message: "آگهی مورد علاقه اضافه شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.get("/", requireAuth, async (req, res) => {
    try {
        const {page = 1, limit = 12, sort = "newest"} = req.query;

        const favorites = await Favorite.find({})
            .populate({path: "advertiseId"})
            .sort(generateSort(sort))
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        res.status(200).json({data: favorites, status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

router.delete("/:id", requireAuth, async (req, res) => {
    try {
        const {id} = req.params;

        if (!isValidObjectId(id)) {
            return res.status(409).json({error: "فرمت id نادرست است", status: "failure"});
        }

        const favorite = await Favorite.findById(id);

        if (!favorite) {
            return res.status(409).json({error: "علاقه مندی با این مشخصات وجود ندارد", status: "failure"});
        }

        await Favorite.deleteOne({_id: id});

        res.status(200).json({message: "آگهی مورد علاقه حذف شد", status: "success"});
    } catch (err) {
        res.status(500).json({message: "مشکلی در سرور به وجود آمده است", status: "failure"});
    }
});

module.exports = router;