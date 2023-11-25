// libraries
require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// controllers
const authController = require("./src/controllers/authController.js");
const userController = require("./src/controllers/userController.js");
const advertiseController = require("./src/controllers/advertiseController.js");
const myAdvertiseController = require("./src/controllers/myAdvertiseController.js");
const favoriteController = require("./src/controllers/favoriteController.js");

const app = express();

// middlewares
app.use('/public', express.static(process.cwd() + '/public'))
app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": true,
    "optionsSuccessStatus": 204
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// connecting to database
require("./src/utils/database.js")

// routes
app.use("/api/auth" , authController);
app.use("/api/user" , userController);
app.use("/api/advertise" , advertiseController);
app.use("/api/myAdvertise" , myAdvertiseController);
app.use("/api/favorite" , favoriteController);

// connecting to server
app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
});