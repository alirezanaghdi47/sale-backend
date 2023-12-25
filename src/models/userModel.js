// libraries
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        default: null,
        maxLength: 20,
    },
    family: {
        type: String,
        default: null,
        maxLength: 40,
    },
    avatar: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        required: true,
        dropDups: true
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    phoneNumber: {
        type: String,
        default: null,
    },
    status: {
        type: Number,
        default: 0,
    },
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

module.exports = User;