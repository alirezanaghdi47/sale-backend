// libraries
const mongoose = require("mongoose");

const logSchema = mongoose.Schema({
    platform: {
        type: String,
        default: null,
    },
    browser: {
        type: String,
        default: null,
    },
    country: {
        type: String,
        default: null,
    },
    city: {
        type: String,
        default: null,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true});

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
