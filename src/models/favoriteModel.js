// libraries
const mongoose = require("mongoose");

const favoriteSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    advertiseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Advertise"
    }
}, {timestamps: true});

const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;