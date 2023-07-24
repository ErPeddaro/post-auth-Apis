const express = require("express");
const router = express.Router();

// Middlewares
const verifyToken = require("../middleware/verifyJWT.js");

// Models
const User = require("../models/userSchema");

router.get("/auth", verifyToken, async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password -_id");
		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
