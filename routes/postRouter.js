const express = require("express");
const router = express.Router();

// Images
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

// Middlewares
const verifyToken = require("../middleware/verifyJWT.js");

// Models
const Post = require("../models/postSchema.js");

router.get("/post", async (req, res) => {
	try {
		const post = await Post.find({});
		res.status(200).json(post);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./temp/");
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + "-" + file.originalname);
	},
});

const upload = multer({
	storage: storage,
	fileFilter: function (req, file, cb) {
		if (!file.mimetype.startsWith("image/")) {
			return cb(
				new Error(`File needs to be an image. current type: ${file.mimetype}`)
			);
		}
		cb(null, true);
	},
});

const handleUploadError = function (err, req, res, next) {
	if (err instanceof multer.MulterError) {
		res
			.status(400)
			.json({ error: "File needs to be an image or: " + err.message });
	} else if (err) {
		res.status(400).json({ error: err.message });
	} else {
		next();
	}
};

router.post(
	"/post",
	verifyToken,
	upload.single("image"),
	handleUploadError,
	async (req, res) => {
		const { title, shortTitle, content } = req.body;
		const imagePath = req.file.path;

		await sharp(imagePath)
			.resize(800)
			.jpeg({ quality: 80 })
			.toFile(`uploads/${req.file.filename}`)
			.then(() => {
				fs.unlink(imagePath, (err) => {
					if (err) {
						console.error(
							"Errore durante la cancellazione del file: ",
							err.message
						);
						return;
					}

					console.log("File cancellato con successo.");
				});
			});

		const newPost = new Post({
			title: title,
			shortTitle: shortTitle,
			content: content,
			imagePath: `uploads/${req.file.filename}`,
		});

		try {
			await newPost.save();
			res.status(200).json(newPost);
		} catch (err) {
			res.status(500).json({ error: err.message });
		}
	}
);

router.put(
	"/post/:id",
	verifyToken,
	upload.single("image"),
	handleUploadError,
	async (req, res) => {
		const { title, shortTitle, content } = req.body;
		const postId = req.params.id;
		let imagePath = req.file && req.file.path;

		if (imagePath) {
			await sharp(imagePath)
				.resize(800)
				.jpeg({ quality: 80 })
				.toFile(`uploads/${req.file.filename}`)
				.then(() => {
					fs.unlink(imagePath, (err) => {
						if (err) {
							res.status(500).json("Error during file deletion: ", err);
							return;
						}
					});
				});
			imagePath = `uploads/${req.file.filename}`;
		}

		try {
			const oldPost = await Post.findById(postId);
			fs.unlink(oldPost.imagePath, (err) => {
				if (err) {
					if (err.code === "ENOENT") {
						return;
					}
					return res.status(500).json({
						error: "An error occurred while deleting the file: " + err.message,
					});
				}
			});
		} catch (err) {
			res.status(500).json({ error: err.message });
		}

		try {
			const updatedPost = await Post.findByIdAndUpdate(
				postId,
				{
					title: title,
					shortTitle: shortTitle,
					content: content,
					imagePath: imagePath,
				},
				{ new: true }
			);
			res.status(200).json(updatedPost);
		} catch (err) {
			res.status(500).json({ error: err.message });
		}
	}
);

module.exports = router;
