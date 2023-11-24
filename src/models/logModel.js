// libraries
const mongoose = require("mongoose");

const logSchema = mongoose.Schema({
    platform: {
        type: String,
        require: true
    },
    browser: {
        type: String,
        require: true
    },
    country: {
        type: String,
        require: true
    },
    city: {
        type: String,
        require: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true});

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
