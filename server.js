const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

// routes
const loginRouter = require("./routes/loginRouter");
const registerRouter = require("./routes/registerRouter");
const decodeToken = require("./routes/decodeToken");
const postRouter = require("./routes/postRouter");

app.use(cors());

app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use("/api", loginRouter);
app.use("/api", registerRouter);
app.use("/api", decodeToken);
app.use("/api", postRouter);

app.get("/", (req, res) => {
	res.send("Everything working fine!!");
});

const dbUrl = "mongodb://localhost:27017/database";

mongoose
	.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("Database connected"))
	.catch((err) => console.error(err));

app.listen(5000, () => {
	console.log("Backend server listening on port 5000!");
});
