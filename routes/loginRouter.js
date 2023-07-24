const express = require("express");
const router = express.Router();

// Middlewares
// const verifyToken = require("../middleware/verifyJWT.js");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/userSchema");

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

router.post("/login", async (req, res) => {
	const { username, password } = req.body;
	try {
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(401).json({ message: "Invalid username or password" });
		}

		const isMatch = await bcrypt.compare(
			password.toString(),
			user.password.toString()
		);
		if (isMatch) {
			const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
				expiresIn: "6h",
			});
			res.status(200).json({ token });
		} else {
			res.status(401).json({ message: "Invalid username or password" });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
