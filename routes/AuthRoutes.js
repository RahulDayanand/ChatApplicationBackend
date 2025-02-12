const express = require("express");
const { registerUser, loginUser } = require("../controllers/user.controller");

const AuthRouter = express.Router();

AuthRouter.post("/register", registerUser);
AuthRouter.post("/login", loginUser);

module.exports = {
    AuthRouter,
}