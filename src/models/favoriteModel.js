// libraries
const mongoose = require("mongoose");

const favoriteSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    advertiseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Advertise",
        required: true
    }
}, {timestamps: true});

const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;