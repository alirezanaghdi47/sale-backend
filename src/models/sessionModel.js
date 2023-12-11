// libraries
const mongoose = require("mongoose");

const sessionSchema = mongoose.Schema({
    status: {
        type: Number,
        default: 0,
        required: true,
    },
    expire: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;