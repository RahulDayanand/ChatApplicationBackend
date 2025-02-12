const { User } = require("../models/user.model");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if(existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            password: hashedPassword
        });

        await user.save();

        const accessToken = jwt.sign(
            { id: user._id },
            JWT_SECRET,
            { expiresIn: "4h" }
         );
         
        res.status(201).json({ message: "User registered successfully", accessToken, username });

    } catch (error) {
        res.status(500).json({ error: "Error while registering the user", error });
    }
}

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });

        if(!existingUser) {
            res.status(404).json({ message: "User not found" })
        }

        const isPasswordMatch = await existingUser.comparePassword(password);

        if(!isPasswordMatch) {
            res.status(400).json({ message: "Invalid Password" })
        }
         
        res.status(200).json({ message: "User logged in successfully", username: existingUser.username });
        

    } catch (error) {
        res.status(500).json({ error: "Error while logging the user", error });
    }
}

module.exports = {
    registerUser,
    loginUser
}