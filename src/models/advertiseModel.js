// libraries
const mongoose = require("mongoose");

const advertiseSchema = mongoose.Schema({
    gallery:[
        {
            type: String,
            required: true
        }
    ],
    title:{
        type: String,
        required: true,
        maxLength: 100,
    },
    description:{
        type: String,
        required: true,
        maxLength: 1000,
    },
    category: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    quality: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true});

const Advertise = mongoose.model("Advertise", advertiseSchema);

module.exports = Advertise;