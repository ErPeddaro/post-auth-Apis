const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

const verifyToken = (req, res, next) => {
	const token = req.headers.authorization;
	if (!token) {
		return res.status(401).json({ message: "Token not found" });
	}
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.userId = decoded.userId;
		next();
	} catch (err) {
		res.status(401).json({ error: err.message });
	}
};

module.exports = verifyToken;
