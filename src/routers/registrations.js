const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma.js");

router.post("/", async (req, res) => {
	// Get the username and password from request body
	const { username, password } = req.body;
	const saltRounds = 10;

	// Hash the password: https://github.com/kelektiv/node.bcrypt.js#with-promises
	bcrypt.hash(password, saltRounds, async (err, hashed_pw) => {
		// Save the user using the prisma user model, setting their password to the hashed version
		try {
			const new_user = await prisma.user.create({
				data: {
					username,
					password: hashed_pw,
				},
			});
			delete new_user.password;

			// Respond back to the client with the created users username and id
			res.status(201).json({ user: new_user });
		} catch (e) {
			if (error.code === "P2002") {
				res.status(403).json({ ewrror: "The username is already taken" });
			} else {
				res.status(500).json({ error: e });
			}
		}
	});
});

module.exports = router;
