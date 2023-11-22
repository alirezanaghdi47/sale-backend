// libraries
const mongoose = require("mongoose");
require("dotenv").config();

// connecting to database
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("Mongo DB connected ..."))
    .catch((err) => console.log(err));