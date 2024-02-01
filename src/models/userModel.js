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
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    age: {
        type: String,
        default: null,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
    },
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

module.exports = User;