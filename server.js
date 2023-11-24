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

const server = express();

// middlewares
server.use(cors({
    origin: true,
    credentials: true,
}));
server.use(express.json());
server.use(express.urlencoded({extended: true}));
server.use(bodyParser.urlencoded());
server.use(bodyParser.json());

server.use(express.static(path.dirname('/public')));

// connecting to database
require("./src/utils/database.js")

// routes
server.use("/api/auth" , authController);
server.use("/api/user" , userController);
server.use("/api/advertise" , advertiseController);
server.use("/api/myAdvertise" , myAdvertiseController);
server.use("/api/favorite" , favoriteController);

// connecting to server
server.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
});